require 'sinatra'
require "sinatra/reloader" if development?
require 'active_record'
require 'digest/sha1'
require 'pry'
require 'uri'
require 'open-uri'
require 'bcrypt'
# require 'nokogiri'

###########################################################
# Configuration
###########################################################

set :public_folder, File.dirname(__FILE__) + '/public'

configure :development, :production do
  ActiveRecord::Base.establish_connection(
    :adapter => 'sqlite3',
    :database =>  'db/dev.sqlite3.db'
   )
end

# Handle potential connection pool timeout issues
after do
  ActiveRecord::Base.connection.close
end

# turn off root element rendering in JSON
ActiveRecord::Base.include_root_in_json = false

###########################################################
# Models
###########################################################
# Models to Access the database through ActiveRecord.
# Define associations here if need be
# http://guides.rubyonrails.org/association_basics.html

class Link < ActiveRecord::Base
  attr_accessible :url, :code, :visits, :title, :updated_at

  has_many :clicks

  validates :url, presence: true

  before_save do |record|
    record.code = Digest::SHA1.hexdigest(url)[0,5]
  end
end

class Click < ActiveRecord::Base
  belongs_to :link #, counter_cache: :visits
end

class User < ActiveRecord::Base
  attr_accessible :username, :identifier, :password, :salt

  validates :password, presence: true

  before_save do |record|
    record.identifier = Digest::SHA1.hexdigest(username)
  end
end

###########################################################
# Authentication
###########################################################

enable :sessions
 
# helpers do
 
#   def login?
#     if session[:username].nil?
#       return false
#     else
#       return true
#     end
#   end
 
#   def username
#     return session[:username]
#   end
 
# end

post "/signup" do
  data = JSON.parse(request.body.read)
  username = data['username']
  password = data['password']
  password_salt = BCrypt::Engine.generate_salt
  password_hash = BCrypt::Engine.hash_secret(password, password_salt)
  if User.find_by_username(username)
    {success: false, message: 'Username already exists'}.to_json
  else
    user = User.create(username: username, salt: password_salt, password: password_hash)
    {success: true, id: user.identifier}.to_json
  end
end

post "/login" do
  data = JSON.parse(request.body.read)
  username = data['username']
  password = data['password']
  user = User.find_by_username(username)
  if user != nil
    password_hash = BCrypt::Engine.hash_secret(password, user[:salt])
    if user[:password] == password_hash
      {success: true, id: user.identifier}.to_json
    else
      {success: false, message: 'Incorrect username or password'}.to_json
    end
  else
    {success: false, message: 'User not found'}.to_json
  end
end

###########################################################
# Routes
###########################################################
# /links?filter_by=amazon
# /links?order_by=visits or lastVisited

get '/' do
  erb :index
end

get '/sort/*' do
  erb :index
end

get '/signup' do
  erb :index
end

get '/login' do
  erb :index
end

post '/links' do
  data = JSON.parse request.body.read
  uri = URI(data['url'])
  puts 'Post request: '
  puts uri
  raise Sinatra::NotFound unless uri.absolute?
  link = Link.find_by_url(uri.to_s) ||
      Link.create( url: uri.to_s, title: get_url_title(uri) )
  link.as_json.merge(base_url: request.base_url).to_json
end

get '/links?:display' do
  puts 'get request received'
  puts params.inspect
  if(params['sort_by']==='visits')
   links = Link.order("visits DESC")
  else
   links = Link.order('updated_at DESC')
  end
  links.map { |link|
    link.as_json.merge(base_url: request.base_url)
  }.to_json
end



get '/stats/:id' do
  puts 'get request received'
  link_id = params['id'].to_i
  clicks = Click.where(link_id: link_id)
  clicks.map { |click|
    click.as_json.merge(base_url: request.base_url)
  }.to_json
end

get '/:url' do
  link = Link.find_by_code params[:url]
  raise Sinatra::NotFound if link.nil?
  link.clicks.create!
  link.visits += 1
  link.save
  link.touch
  redirect link.url
end

###########################################################
# Utility
###########################################################

def read_url_head url
  head = ""
  url.open do |u|
    begin
      line = u.gets
      next  if line.nil?
      head += line
      break if line =~ /<\/head>/
    end until u.eof?
  end
  head + "</html>"
end

def get_url_title url
  # Nokogiri::HTML.parse( read_url_head url ).title
  result = read_url_head(url).match(/<title>(.*)<\/title>/)
  result.nil? ? "" : result[1]
end

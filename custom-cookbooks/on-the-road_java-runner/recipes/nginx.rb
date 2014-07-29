execute "rm /etc/nginx/sites-available/default"

cookbook_file "nginx_site" do
  path "/etc/nginx/sites-available/default"
  action :create_if_missing
end

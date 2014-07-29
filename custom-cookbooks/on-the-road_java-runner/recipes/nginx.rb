execute "rm /etc/nginx/sites-available/default"
execute "killall nginx"

cookbook_file "nginx_site" do
  path "/etc/nginx/sites-available/default"
  action :create
  notifies :restart, "service[nginx]"
end



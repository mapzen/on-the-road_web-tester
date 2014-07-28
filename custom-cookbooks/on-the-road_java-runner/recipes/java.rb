include_recipe 'logrotate'
include_recipe 'java'

directory "/work" do
  owner 'vagrant'
  group 'vagrant'
  action :create
end

runit_service 'runner'

remote_file "/work/runner.jar" do
  source "http://android.mapzen.com/on-the-road-with-deps-latest.jar"
  notifies :restart, "runit_service[runner]"
end


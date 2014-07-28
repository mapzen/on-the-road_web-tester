directory "/work" do
  owner 'vagrant'
  group 'vagrant'
  action :create
end

git "/work/web-tester" do
  repository "https://github.com/mapzen/on-the-road_web-tester.git"
  user 'vagrant'
  group 'vagrant'
  action :sync
end

runit_service 'runner_node'

execute "/usr/local/bin/npm install" do
  cwd "/work/web-tester/node"
  notifies :restart, "runit_service[runner_node]"
end


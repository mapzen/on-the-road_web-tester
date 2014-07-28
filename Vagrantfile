# -*- mode: ruby -*-
# vi: set ft=ruby :

VAGRANTFILE_API_VERSION = "2"

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|
  config.vm.hostname = "on-the-road.web-tester"

  config.vm.box     = 'ubuntu-14.04-official'
  config.vm.box_url = 'https://cloud-images.ubuntu.com/vagrant/trusty/current/trusty-server-cloudimg-amd64-vagrant-disk1.box'

  config.vm.network :private_network, ip: "33.33.33.10"
  config.vm.network :forwarded_port, host: 8080, guest: 80
  config.vm.network :forwarded_port, host: 8000, guest: 8000

  config.vm.provision "chef_solo" do |chef|
  chef.cookbooks_path = "cookbooks"
  #   chef.roles_path = "../my-recipes/roles"
  #   chef.data_bags_path = "../my-recipes/data_bags"
  #   chef.add_recipe "mysql"
  #   chef.add_role "web"
  #
  #   # You may also specify custom JSON attributes:
  chef.json = { 
    "java" => {
      "install_flavor" =>  "openjdk",
      #"jdk_version" => "7",
      #  "oracle" => {
      #    "accept_oracle_download_terms" => true
      # }
    },
    "maven" => { 
      "3" => {
        "version" => "3.1.1"
      },
      "version" => "3"
    },
    "package_installer" => {
      "packages" => {
        "sqlite3" => nil,
        "tree" => nil,
        "build-essential" => nil
     }
    },
    "authorization" => {
      "sudo" => {
        "users" => ["vagrant"],
        "passwordless" => true
      }
    }
  }
  chef.run_list = [
    "recipe[java]",
    "recipe[package_installer]",
    "recipe[maven]",
    "recipe[sudo]",
    "recipe[ohai]",
    "recipe[apt]",
    "recipe[git]",
    "recipe[nodejs]",
    "recipe[mongodb]",
    "recipe[zeromq]",
    "recipe[nginx]",
    "recipe[on-the-road_java-runner::java]",
    "recipe[on-the-road_java-runner::node]"
  ]
  end
end

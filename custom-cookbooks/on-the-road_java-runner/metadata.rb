maintainer       "mapzen"
maintainer_email "baldur@mapzen.com"
license          "Apache 2.0"
version          "0.1.1"
description      "cookbook"

%w[debian ubuntu].each do |os|
  supports os
end

%w[npm apt logrotate java].each do |cb|
  depends cb
end

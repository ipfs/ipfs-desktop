standard index.js || exit
rm -R pkg
sudo rm -R /home/mumin/Desktop/x64
npm run package
sudo cp -R pkg/0.1.0/linux/x64 /home/mumin/Desktop

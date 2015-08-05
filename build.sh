rm -r build
mkdir build 2> /dev/null
mkdir build/js
browserify app/js/menubar.jsx > build/js/menubar.js
browserify app/js/welcome.jsx > build/js/welcome.js
cp app/js/help.js build/js/help.js
cp -r app/views build/views
cp -r app/styles build/styles
cp -r app/img build/img
cp -r app/controls build/controls
cp app/init.js build/init.js
cp app/config.js build/config.js

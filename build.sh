rm -r build
mkdir build 2> /dev/null
mkdir build/js
browserify app/js/menu.jsx > build/js/menu.js
browserify app/js/initialize.jsx > build/js/initialize.js
cp app/js/help.js build/js/help.js
cp -r app/views build/views
cp -r app/styles build/styles
cp -r app/img build/img
cp app/init.js build/init.js

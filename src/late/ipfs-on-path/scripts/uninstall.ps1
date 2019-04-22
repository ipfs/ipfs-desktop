# Get it
$path = [System.Environment]::GetEnvironmentVariable(
  'PATH',
  'User'
)

# Remove unwanted elements
$path = ($path.Split(';') | Where-Object { $_ -ne "$PSScriptRoot/bin-win" }) -join ';'

echo $path

# Set it
[System.Environment]::SetEnvironmentVariable(
  'PATH',
  $path,
  'User'
)

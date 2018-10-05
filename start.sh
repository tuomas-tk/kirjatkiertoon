echo ">>> Exporting environment variables into a file /etc/environment"
printenv >> /etc/environment
cat /etc/environment
echo
echo ">>> Starting KirjatKiertoon.fi, waiting 5 seconds for the database"
sleep 5
echo
echo ">>> Running migrations with db-migrate"
./node_modules/db-migrate/bin/db-migrate up
echo
echo ">>> Starting cron to the background"
cron
echo
echo ">>> Starting server"
node server/index.js

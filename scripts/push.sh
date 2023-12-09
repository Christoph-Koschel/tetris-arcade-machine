read -p "Enter the raspi ip: " IP
read -s -p "Enter raspi password: " PASSWORD

source $(dirname $0)/config.sh

echo "Upload ./tetris.tar.gz"
sshpass -p $PASSWORD scp ./tetris.tar.gz "$USERNAME@$IP:/home/$USERNAME/"
echo "Upload ./scripts/remote/setup.sh"
sshpass -p $PASSWORD scp ./scripts/remote/setup.sh "$USERNAME@$IP:/home/$USERNAME/"
echo "Execute ./setup.sh"
sshpass -p $PASSWORD ssh "$USERNAME@$IP" "cd /home/$USERNAME/; chmod 777 setup.sh; ./setup.sh"
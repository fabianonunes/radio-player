DEST="app/assets/audio"
mkdir -p $DEST
wget "http://www12.senado.gov.br/radio/@@audio/6a83edd9-5462-47a3-aab8-6180707b09e4?download" -O $DEST/1.mp3
wget "http://www12.senado.gov.br/radio/@@audio/5f5b5e4d-fa5d-47ea-829b-4792ef3be0c0?download" -O $DEST/2.mp3

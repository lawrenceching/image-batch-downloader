FILE=image-batch-downloader.zip
if [ -f "$FILE" ]
then
    rm $FILE
fi
zip -r $FILE . -x '.git/*' '.idea/*' '.DS_Store'
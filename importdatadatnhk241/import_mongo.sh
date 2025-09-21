#!/bin/bash

if [ $# -eq 0 ]; then
    echo "Usage: $0 <collection_name>"
    exit 1
fi

mongosh $1 --eval "db.stats()" > "db_stats_$(date -u +%Y_%m_%d_%H%M%S)"

mongoimport --db $1 --collection blogs --type json --file s1.blogs.json --jsonArray
mongoimport --db $1 --collection service_providers --type json --file s1.svprvd.json --jsonArray
mongoimport --db $1 --collection services --type json --file s1.services.json --jsonArray
mongoimport --db $1 --collection orders --type json --file s1.orders.json --jsonArray
mongoimport --db $1 --collection users --type json --file s1.users.json --jsonArray
mongoimport --db $1 --collection staffs --type json --file s1.staffs.json --jsonArray
mongoimport --db $1 --collection posttags --type json --file s1.posttags.json --jsonArray
mongoimport --db $1 --collection servicecategories --type json --file s1.servicecategories.json --jsonArray
mongoimport --db $1 --collection products --type json --file s1.products.json --jsonArray
mongoimport --db $1 --collection productcategories --type json --file s1.servicecategories.json --jsonArray

find "." -type f -name "*.js" -exec sed -i "s/old/new/g" {} \;

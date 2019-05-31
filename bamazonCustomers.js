var inquirer = require('inquirer');
var mysql = require('mysql');

var connection = mysql.createConnection({
    host: 'localhost',
    port: 3300,

    user: 'root',

    password: 'MyNewPass',
    database: "bamazon"
});

function promtUserPurchase() {
    inquirer.promt([
        {
        type: 'input',
        name: 'item_id',
        message: 'Please enter the Item ID you would like to purchase',
        validate: validateinput,
        filter: Number
    },
    {
        type: 'input',
        name: 'quantity',
        message: 'How many do you need?',
        validate: validateinput,
        filter: Number
    }
]).then(function(input) {
    var item = input.item_id;
    var quantity = input.quantity;

    var queryStr = 'SELECT * FROM products WHERE ?';

    connection.query(queryStr, {item_id: item}, function(err, data) {
        if(err) throw err;

        if(data.length === 0) {
            console.log('ERROR: invalid Item ID. Please select a valid Item ID');
            displayInventory();
        }else {
            var productData = data[0];

            if (quantity<= productData.stock_quanity) {
                console.log('Congrats, the product you requested is in stock! Placing order!');

                var updateQueryStr = 'UPDATE products SET stock_quantity = ' + (productData.stock_quanity - quantity) + 'WHERE item_id = ' + item;

                connection.query(updateQueryStr, function(err, data) {
                    if (err) throw err;

                    console.log('Your order has been placed! your total is $' + productData.price * quantity);
                    console.log('Thank you for shopping');
                    console.log("\n-----------------------------------------------------------\n");
                    
                    connection.end();

                })
            } else {
                    console.log('Sorry, there is not enough product in stock, your order can not be placed as is.');
					console.log('Please modify your order.');
					console.log("\n---------------------------------------------------------------------\n");

					displayInventory();
                }
            }
        })
    })
}

function displayInventory() {
    queryStr = 'SELECT * FROM products';

    connection.query(queryStr, function(err, data) {
        if (err) throw err;

        console.log('Existing Inventory: ');
        console.log('...................\n');
        
        var strOut = '';
        for (var i = 0; i < data.length; i++) {
            strOut = '';
            strOut += 'ItemID: ' + data[i].item_id + '  //  ';
            strOut += 'Product Name: ' + data[i].product_name + '  //  ';
			strOut += 'Department: ' + data[i].department_name + '  //  ';
			strOut += 'Price: $' + data[i].price + '\n';

			console.log(strOut);
        }

        console.log("--------------------------------------\n")

        promtUserPurchase();
    })
}

function runBamazon() {
    displayInventory();
}
runBamazon();
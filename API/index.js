//Import Modules
const express = require('express');
const path = require('path');
const fs = require('fs');
const cryptoJS = require('crypto-js');

const app = express();
const PORT = 8080;

//Set so we can send back JSON
app.use(express.json());
const birds = require('../birds.js');
//Start the server
app.listen(PORT, () => 
    console.log(`Running on http://localhost:${PORT}`)
);

/*Reqests*/
app.use('/birds', birds);
//Post request to register a new user
app.post('/clients', (req, res) => {
    //Get the email and password from the body and check if they are filled in
    const { email } = req.body;
    const { password } = req.body;
    if((!email || !password) || !email && !password){
        res.status(418).send({
            message: "Please enter an email address and/or password"
        })
    }
    
    else {
        //Check if email is valid and not in use
        if(!CheckIfValidEmail(email)){
            res.status(418).send({
                message: "Please enter a valid email."
            })
        }
        else{
            //Encrypt the password and send back the info
            const apiKey = cryptoJS.SHA512(`${password}`);
            res.send({
                YourEmail: `${email}`,
                YourKey: `${apiKey}`
            });
            
            //Read and store data from JSON file
            const jsonData = JSON.parse(fs.readFileSync('users.json'));
            //Add data to jsonData
            jsonData.users.push({
                email: `${email}`,
                password: `${apiKey}`
            });
            // Convert the JavaScript object back into a JSON string
            const jsonString = JSON.stringify(jsonData);
            //Write file back to the file system
            fs.writeFileSync('users.json', jsonString, 'utf-8', (err) => {
                if (err) throw err;
            });
        }
    }
})

//#region Status
app.get('/status', (req, res) => {
    res.status(200).send({
        status: "API is operational"
    })
});
//#endregion
app.get('/allDogs', (req, res) => {
    const authHeader = req.get('Authorization');
    if (checkIfKeyInJson(authHeader)) {
        const filePath = path.join(__dirname, '..', 'dogs.json');
        res.status(200).sendFile(filePath);
    }
    else{
        res.status(403).send({
            "status": "You are not logged in"
        });
    }
});

app.post('/addDog', (req, res) => {
    //Set 
    const { breed, age, weight, name, credit_card, billing_address, owners } = req.body;
    const filePath = path.join(__dirname, '..', 'dogs.json');

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          console.error(err);
          return res.status(500).send('Internal Server Error');
        }

        // Parse the JSON data into a JavaScript object
        let jsonData = JSON.parse(data);
        //const id = jsonData.dogs.length();
        const id = jsonData.dogs.length;
        // Create a new object with the provided values
        const newDog = {
            id,
            breed,
            age,
            weight,
            name,
            credit_card,
            billing_address,
            owners
          };
        // Add the new object to the array
        jsonData.dogs.push(newDog); 
        fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), (err) => {
            if (err) {
              console.error(err);
              return res.status(500).send('Internal Server Error');
            }
        res.status(200).send({
            message: "Doggo created"
        });
      });
    });
});
//#region Tshirt stuff
app.get('/tshirt', (req, res) => {
    res.status(200).send({
        tshirt: '👕',
        size: 'large'
    })
});

app.post('/tshirt/:id', (req, res) =>{
    const { id } = req.params;
    const { logo } = req.body;
    
    if (!logo){
        res.status(418).send({message: "We need a logo"})
    }
    
    res.send({
        tshirt: `👕 with your ${logo} and ID of ${id}`,
    });
});
//#endregion


/*Functions*/
function checkIfKeyInJson(authHeader){
    const JSONObject = JSON.parse(fs.readFileSync('users.json'));
    for (i=0; i < JSONObject.users.length; i++) {
        if (JSONObject.users[i].password == authHeader){
            return true;
        }
    }
}

function CheckIfValidEmail(email){
    var re = /\S+@\S+\.\S+/;
    return re.test(email);
}
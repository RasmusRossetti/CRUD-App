//Funktion för att hämta data från Strapi CMS
async function getDataFromStrapi() {
  //Url till Strapi.js API för att hämta alla Pokemons
  let url = "http://localhost:1337/api/pokemons"

  //Hämtar JSON från API och konverterar det till JS objekt
  let stringResponse = await fetch(url)
  let myObjekt = await stringResponse.json()

  console.log(myObjekt)

  let output = "<table>"

  //Checkar om det är ett eller flera objekt som hämtas
  //Kan undvikas genom flera funktioner; en för alla och en för unik
  if (Array.isArray(myObjekt.data)) {
    //Anropa generateRow för att skapa en HEader-rad
    output += generateRow(myObjekt.data[0].attributes, null, true)

    //Skapar en ForEach loop för varje elemet i Data-arrayen
    myObjekt.data.forEach((element) => {
      //Gör en pekare till attribut objektet
      let obj = element.attributes

      /*for (x in obj) {
                console.log( x + ": " + obj[x]);
            }*/

      //Skriver Output string
      //document.write(`Namn: ${attr.name}`);
      output += generateRow(obj, element.id, false)
    })
  } else {
    //Gör en pekare till attribut objektet
    let obj = myObjekt.data.attributes
    /*for (x in obj) {
            console.log( x + ": " + obj[x]);
        }*/

    //Skapa en Header Rad
    output += generateRow(obj, null, true)

    //Skriver Output string
    output += generateRow(obj, myObjekt.data.id, false)
  }

  //Avsluta <table> tag

  output += "</table>"

  //Skriver ut Output string till div-element
  //document.write(output);
  document.getElementById("pokemonFetched").innerHTML = output
}

//Funktion för att hämta Token för användare
//Om en Token hämtas så betyder det att user/password är korrekt skrivet
async function getToken() {
  /*
    1. Göra ett inloggningsförsök för att få en Token returnerad
    2. Sammla data och skapa ett objekt av dessa
    3. Skicka iväg JSON till API
    */

  let valid = true

  //Validera användarnamn och lösenord!
  if (!validateLogin()) valid = false

  //Validera PokemonData
  if (!validatePokemon()) valid = false

  if (!valid) return null

  //Url till Strapi.js UserList
  const urlUser = "http://localhost:1337/api/auth/local/"

  const user = document.getElementById("user").value
  const pass = document.getElementById("pass").value

  //Skapar ett objekt av det användarnamn och lösenord som user har skrivit in i fält.
  let userObject = {
    identifier: user,
    password: pass
  }

  //Anropar API med inloggningsdata.
  //Inkluderar Method och Headers
  let userResponse = await fetch(urlUser, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(userObject)
  })

  //Konverterar API response JSON string till ett objekt
  let userJson = await userResponse.json()
  console.log(userJson)

  //Kontrollerar om objektet har Token.
  //Token ligger under attribut jwt
  //Om så; inloggning är korrekt. Fortsätt till funktion postData med token som parameter.
  if (userJson.jwt) return userJson.jwt
  else {
    //Inloggningen har misslyckats. Skriv ut errormeddelande från Strapi.js
    let errMessage = userJson.error.message

    document.getElementById("userError").innerText = errMessage

    return null
  }
}

async function postData() {
  //Anropa GetToken() för att få en inloggnings-nyckel.
  //Om detta misslyckas, avbryt funktionen.
  let token = await getToken()
  if (!token) return

  //URL till Strapi Pokemon collection.
  const urlPokemon = "http://localhost:1337/api/pokemons/"

  // Hämtar data från fält
  const name = document.getElementById("name").value
  const type = document.getElementById("type").value
  const level = document.getElementById("level").value

  //Skapa ett objekt med data inkluderat.
  let pokemonObjekt = {
    data: {
      name: name,
      type: type,
      level: level
    }
  }

  //Anropar API med pokemonObjekt
  let pokemonResponse = await fetch(urlPokemon, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token //Inkluderar Token från inloggning tidigare.
    },
    body: JSON.stringify(pokemonObjekt)
  })

  let pokemonJson = await pokemonResponse.json()

  console.log(pokemonJson)
  await getDataFromStrapi()
}

//Funktioner för validering
//Validering av User Input
function userValidate(comp) {
  // 1. Fältet måste vara ifyllt

  let valid = true

  if (comp.value.length == 0) {
    //Misslyckad validering
    valid = false
  }

  //Check on lyckad validering
  if (!valid) {
    document.getElementById("userError").innerText =
      "Du måste fylla i ett användarnamn!"
    return false
  } else {
    document.getElementById("userError").innerText = ""
    return true
  }
}

//Validering av Password input
function passValidate(comp) {
  // 1. Fältet måste vara minst 5 tecken eller längre

  let valid = true

  if (comp.value.length <= 4) {
    //Misslyckad validering
    valid = false
  }

  //Check on lyckad validering
  if (!valid) {
    document.getElementById("passwordError").innerText =
      "Lösenordet måste vara minst 5 tecken långt!"
    return false
  } else {
    document.getElementById("passwordError").innerText = ""
    return true
  }
}

//funktion för validering av inloggninfsförsök
function validateLogin() {
  //Variabel
  let valid = true

  //Validate Användarnamn
  if (!userValidate(document.getElementById("user"))) {
    valid = false
  }

  //Validate Password
  if (!passValidate(document.getElementById("pass"))) {
    valid = false
  }

  return valid
}

//Funktion för validering av Pokemon Name
function pokemonNameValidate(comp) {
  // 1. Fältet måste innehålla ett värde
  // 2. Fältet får inte vara ett nummer

  let valid = true

  //CHeck om value är större än 0
  if (comp.value.length == 0) {
    //Felaktig validering
    valid = false
    document.getElementById("pokeNameError").innerText =
      "Pokemon Name måste vara ifyllt."
  }

  //CHeck att värdet inte är ett nummer
  if (!isNaN(comp.value) && comp.value.length != 0) {
    //Felaktig validering
    valid = false
    document.getElementById("pokeNameError").innerText =
      "Namnet får inte vara ett nummer."
  }

  if (valid) {
    document.getElementById("pokeNameError").innerText = ""
  }

  return valid
}

//FUnktion för validering av Pokemon
function validatePokemon() {
  let valid = true

  //Validate PokemonName
  if (!pokemonNameValidate(document.getElementById("name"))) {
    valid = false
  }

  //TODO - Skapa validering för Type och Level

  return valid
}

//Genererat tabellrad med det inkludera objektet. Skapar TH rad om header=true
function generateRow(obj, objId, header) {
  let output = "<tr>"
  let forbiddenParameters = ["createdAt", "updatedAt", "publishedAt"]

  //For in loop för att gå igenom alla parametrar i obj
  for (x in obj) {
    /*
        x = parameterns namn
        obj[x] = parameterns värde
        */

    //Kontrollera att x är en tillåten parameter.
    // Keyword Continue går vidare till nästa parameter i loopen
    //Fungerar också i en ForEach loop.
    if (forbiddenParameters.includes(x)) continue

    if (header) output += `<th>${x}</th>`
    else output += `<tbody><td>${obj[x]}</td></tbody>`
  }

  //Skapa update och Delete knapp för TD rad
  if (!header) {
    //URL för den specifika posten
    let postURL = `http://localhost:1337/api/pokemons/${objId}`

    output += `<td><button onclick="updatePost('${postURL}');">Update Post</button></td>`
    output += `<td><button onclick="deletePost('${postURL}');">Delete Post</button></td>`
  }

  //Stänga <tr> taggen
  output += "</tr>"

  return output
}

async function updatePost(url) {
  //Hämta Token från GetToken()
  //Om ingen Token returneras, avbryt funktionen
  let token = await getToken()
  if (!token) return

  // Hämtar data från fält
  const name = document.getElementById("name").value
  const type = document.getElementById("type").value
  const level = document.getElementById("level").value

  //Skapa ett objekt med data inkluderat.
  let pokemonObjekt = {
    data: {}
  }

  //Fyller upp Data med parameter-värden
  if (name) pokemonObjekt.data["name"] = name
  if (type) pokemonObjekt.data["type"] = type
  if (level) pokemonObjekt.data["level"] = level

  //Anropar API med pokemonObjekt
  await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token //Inkluderar Token från inloggning tidigare.
    },
    body: JSON.stringify(pokemonObjekt)
  })

  //Anropa "GetDataFromStrapi" för att skriva ut ny tabell
  await getDataFromStrapi()
}

async function deletePost(url) {
  //Hämta Token från GetToken()
  //Om ingen Token returneras, avbryt funktionen
  let token = await getToken()
  if (!token) return

  //Anropar API med inloggningsdata.
  //Inkluderar Method och Headers
  await fetch(url, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token //Inkluderar Token från inloggning tidigare.
    }
  })

  //Anropa "GetDataFromStrapi" för att skriva ut ny tabell
  await getDataFromStrapi()
}


async function getDataFromStrapi() {
  
  let url = "http://localhost:1337/api/pokemons"

  let stringResponse = await fetch(url)
  let myObjekt = await stringResponse.json()

  console.log(myObjekt)

  let output = "<table>"

  
  if (Array.isArray(myObjekt.data)) {
    
    output += generateRow(myObjekt.data[0].attributes, null, true)

    
    myObjekt.data.forEach((element) => {
      
      let obj = element.attributes

    
      output += generateRow(obj, element.id, false)
    })
  } else {
    
    let obj = myObjekt.data.attributes
    

    output += generateRow(obj, null, true)

    output += generateRow(obj, myObjekt.data.id, false)
  }

 

  output += "</table>"


  document.getElementById("pokemonFetched").innerHTML = output
}


async function getToken() {


  let valid = true


  if (!validateLogin()) valid = false

  
  if (!validatePokemon()) valid = false

  if (!valid) return null

 
  const urlUser = "http://localhost:1337/api/auth/local/"

  const user = document.getElementById("user").value
  const pass = document.getElementById("pass").value

 
  let userObject = {
    identifier: user,
    password: pass
  }


  let userResponse = await fetch(urlUser, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(userObject)
  })


  let userJson = await userResponse.json()
  console.log(userJson)

 
  if (userJson.jwt) return userJson.jwt
  else {
  
    let errMessage = userJson.error.message

    document.getElementById("userError").innerText = errMessage

    return null
  }
}

async function postData() {

  let token = await getToken()
  if (!token) return


  const urlPokemon = "http://localhost:1337/api/pokemons/"


  const name = document.getElementById("name").value
  const type = document.getElementById("type").value
  const level = document.getElementById("level").value


  let pokemonObjekt = {
    data: {
      name: name,
      type: type,
      level: level
    }
  }

 
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


function userValidate(comp) {


  let valid = true

  if (comp.value.length == 0) {
    //Misslyckad validering
    valid = false
  }


  if (!valid) {
    document.getElementById("userError").innerText =
      "Du måste fylla i ett användarnamn!"
    return false
  } else {
    document.getElementById("userError").innerText = ""
    return true
  }
}


function passValidate(comp) {


  let valid = true

  if (comp.value.length <= 4) {
   
    valid = false
  }

 
  if (!valid) {
    document.getElementById("passwordError").innerText =
      "Lösenordet måste vara minst 5 tecken långt!"
    return false
  } else {
    document.getElementById("passwordError").innerText = ""
    return true
  }
}


function validateLogin() {

  let valid = true

 
  if (!userValidate(document.getElementById("user"))) {
    valid = false
  }


  if (!passValidate(document.getElementById("pass"))) {
    valid = false
  }

  return valid
}


function pokemonNameValidate(comp) {
 
  let valid = true


  if (comp.value.length == 0) {
    
    valid = false
    document.getElementById("pokeNameError").innerText =
      "Pokemon Name måste vara ifyllt."
  }


  if (!isNaN(comp.value) && comp.value.length != 0) {
   
    valid = false
    document.getElementById("pokeNameError").innerText =
      "Namnet får inte vara ett nummer."
  }

  if (valid) {
    document.getElementById("pokeNameError").innerText = ""
  }

  return valid
}


function validatePokemon() {
  let valid = true

 
  if (!pokemonNameValidate(document.getElementById("name"))) {
    valid = false
  }


  return valid
}


function generateRow(obj, objId, header) {
  let output = "<tr>"
  let forbiddenParameters = ["createdAt", "updatedAt", "publishedAt"]


  for (x in obj) {

    if (forbiddenParameters.includes(x)) continue

    if (header) output += `<th>${x}</th>`
    else output += `<tbody><td>${obj[x]}</td></tbody>`
  }

 
  if (!header) {
   
    let postURL = `http://localhost:1337/api/pokemons/${objId}`

    output += `<td><button onclick="updatePost('${postURL}');">Update Post</button></td>`
    output += `<td><button onclick="deletePost('${postURL}');">Delete Post</button></td>`
  }

 
  output += "</tr>"

  return output
}

async function updatePost(url) {

  let token = await getToken()
  if (!token) return


  const name = document.getElementById("name").value
  const type = document.getElementById("type").value
  const level = document.getElementById("level").value

  
  let pokemonObjekt = {
    data: {}
  }


  if (name) pokemonObjekt.data["name"] = name
  if (type) pokemonObjekt.data["type"] = type
  if (level) pokemonObjekt.data["level"] = level


  await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token //Inkluderar Token från inloggning tidigare.
    },
    body: JSON.stringify(pokemonObjekt)
  })

 
  await getDataFromStrapi()
}

async function deletePost(url) {

  let token = await getToken()
  if (!token) return


  await fetch(url, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token //Inkluderar Token från inloggning tidigare.
    }
  })

  
  await getDataFromStrapi()
}

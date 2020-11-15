module.exports = (res, error) => {
    // On arrive ici si une erreur a été renvoyée (throw)
    // On envoie l'erreur à la FE
    const errorData = JSON.stringify(error)

    res.writeHead(400, {'Content-Type': 'application/json'})
    res.write(errorData)
    res.end()
}
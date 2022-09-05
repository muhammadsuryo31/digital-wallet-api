const filterRequestBody = (requestBody, ...filterKeyword) => {
    const filteredRequest = {}
    Object.keys(requestBody).forEach( field => {
        if(filterKeyword.includes(field)) {
            filteredRequest[field] = requestBody[field]
        }
    })
    return filteredRequest
}

module.exports = filterRequestBody
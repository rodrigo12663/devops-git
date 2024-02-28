const axios = require('axios').default


module.exports.CreateContact = async ({ nome, email, oab, p1,cpf,uf,tipo,telefone,cns,sobrenome }) => {
	
    let telefoneNumbers = telefone.replace(/\s/g,'')
	
	const formatNome = nome[0].toUpperCase() + nome.slice(1)
	const formatSobrenome = sobrenome[0].toUpperCase() + sobrenome.slice(1)
	
	if(telefoneNumbers.length == 11){
        telefoneNumbers = telefoneNumbers.slice(0, 3) + telefoneNumbers.slice(4);
        telefoneNumbers = '55' + telefoneNumbers
    } else if (telefoneNumbers.length == 10){
        telefoneNumbers = '55' + telefoneNumbers
    }
	
    let data =
        `<contactUser>
            <shortCode>EXT_${cpf.replace(/[.]/g,'').replace(/[-]/,'')}</shortCode>
            <csgId>5</csgId>
            <assystUserAliasId>211</assystUserAliasId>
            <licenceRoleId>4</licenceRoleId>
            <emailAddress>${email}</emailAddress>
            <password>${p1}</password>
			<officeTelephone>${telefoneNumbers}</officeTelephone>
			<workMobile>${telefone}</workMobile>
			<departmentId>1</departmentId>
            <name>${formatNome} ${formatSobrenome}</name>
            <loginName>EXT_${cpf.replace(/[.]/g,'').replace(/[-]/,'')}</loginName>
            <roomId>453</roomId> 
            <customFields>
                <customFieldShortCode>OAB</customFieldShortCode>
                <stringValue>${oab}</stringValue>
            </customFields>
            <customFields>
                <customFieldShortCode>CNS</customFieldShortCode>
                <stringValue>${cns}</stringValue>
            </customFields>
            <customFields>
                <customFieldShortCode>UF</customFieldShortCode>
                <stringValue>${uf}</stringValue>
            </customFields>
        </contactUser>`

        console.log(data)
		//console.log('https://llk85s20081.lanlink.com.br/assystREST/v2/contactUsers')
    let headers = {
        'Authorization': 'Basic ' + 'YXNzeXN0d2ViOjEyMzQ1cXdlcnQhQCMkJQ==',
        'Content-Type': 'application/xml'
    };

    try {
         const result = await axios.post('http://assystapi02/assystREST/v2/contactUsers', data, { headers: headers })
         const login = result.data.loginName
         const email = result.data.emailAddress
         return { login, email }

    } catch (error) {
		console.log(error)
        console.log(error.response.data)
        return {error : error.response.data.errors}
    }

}
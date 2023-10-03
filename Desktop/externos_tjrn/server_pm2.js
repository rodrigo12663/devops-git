const express = require('express')
const bodyParser = require('body-parser')
const expressLayouts = require('express-ejs-layouts')
const { check, validationResult } = require('express-validator');
const app = express()
const port = 8888
const assyst = require('./assyst-service')
const helmet = require('helmet')
const morgan = require('morgan')
const fs = require('fs')
const path = require('path')
const https = require("https");

const options = {
	pfx: fs.readFileSync("C:\\PROJETOS_INTEGRACAO\\Externos TJRN\\Externos TJRN\\certificado-lanlink.pfx"),
    //pfx: fs.readFileSync("E:\\Externos TJRN\\certificado-lanlink.pfx"),
    passphrase: "sw2aq1SW@AQ"
};


const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });

app.use(helmet())
app.use(morgan('combined',{stream: accessLogStream}))

app.set('view engine', 'ejs')
app.use(expressLayouts)
app.use(bodyParser.urlencoded())

app.use(express.static(__dirname + '/public'))

app.get('/', (req, res) => {
    res.render('pages/contact')
})


function validarCPF(cpf) {
    cpf = cpf.replace(/[^\d]+/g, '');
    if (cpf == '') return false;
    // Elimina CPFs invalidos conhecidos	
    if (cpf.length != 11 ||
        cpf == "00000000000" ||
        cpf == "11111111111" ||
        cpf == "22222222222" ||
        cpf == "33333333333" ||
        cpf == "44444444444" ||
        cpf == "55555555555" ||
        cpf == "66666666666" ||
        cpf == "77777777777" ||
        cpf == "88888888888" ||
        cpf == "99999999999")
        return false;
    // Valida 1o digito	
    add = 0;
    for (i = 0; i < 9; i++)
        add += parseInt(cpf.charAt(i)) * (10 - i);
    rev = 11 - (add % 11);
    if (rev == 10 || rev == 11)
        rev = 0;
    if (rev != parseInt(cpf.charAt(9)))
        return false;
    // Valida 2o digito	
    add = 0;
    for (i = 0; i < 10; i++)
        add += parseInt(cpf.charAt(i)) * (11 - i);
    rev = 11 - (add % 11);
    if (rev == 10 || rev == 11)
        rev = 0;
    if (rev != parseInt(cpf.charAt(10)))
        return false;
    return true;
}




app.post('/', [
    check('email', 'Email não está no formato de email').isEmail(),
    check('email', 'Email é obrigatório').not().isEmpty(),
    check('telefone', 'Telefone é obrigatório').not().isEmpty(),
    check('tipo', 'Tipo de usuário é obrigatório').not().isEmpty(),
    check('cpf', 'CPF é obrigatório').not().isEmpty(),
    check('nome', 'Nome é obrigatório').not().isEmpty(),
    check('p1', 'Senha é obrigatório').not().isEmpty(),
    check('p2', 'Confirmação de senha é obrigatório').not().isEmpty(),

], async (req, res) => {
    const result = validationResult(req);
    var errors = result.errors;
    const p1 = req.body.p1
    const p2 = req.body.p2
    const tipo = req.body.tipo
    const oab = req.body.oab
    const uf = req.body.uf
    const cpf = req.body.cpf
    const cns = req.body.cns

    if (!validarCPF(cpf)) {
        errors.push(
            {
                value: '',
                msg: 'O campo cpf não é valido',
                param: 'cpf',
                location: 'body'
            }
        )
    }

    if (p1 !== '' && p2 !== '') {
        if (p1 !== p2) {
            errors.push(
                {
                    value: '',
                    msg: 'O campo senha e confirmação devem ter o mesmo valor',
                    param: 'p1',
                    location: 'body'
                }
            )
        }
    }
    if (tipo === "adv") {
        if (oab === '') {
            errors.push(
                {
                    value: '',
                    msg: 'O campo OAB é obrigatorio para o usuário do tipo Advogado',
                    param: 'oab',
                    location: 'body'
                }
            )
        }
        if (uf === '') {
            errors.push(
                {
                    value: '',
                    msg: 'O campo UF é obrigatorio para o usuário do tipo Advogado',
                    param: 'uf',
                    location: 'body'
                }
            )
        }
    }else if (tipo === "car") {
        if (cns === '') {
            errors.push(
                {
                    value: '',
                    msg: 'O campo cns é obrigatorio para o usuário do tipo Cartorio',
                    param: 'cns',
                    location: 'body'
                }
            )
        }
        if (uf === '') {
            errors.push(
                {
                    value: '',
                    msg: 'O campo UF é obrigatorio para o usuário do tipo Cartorio',
                    param: 'uf',
                    location: 'body'
                }
            )
        }
    }



    if (errors.length > 0) {

        res.render('pages/contact', {
            errors: errors,
            usuario: req.body
        })
    } else {
        const result = await assyst.CreateContact(req.body)
        if (result.error) {
            console.log('erro')
            res.render('pages/contact', { errors: result.error, })
        }
        else {
            console.log('ok')
            res.render('pages/viewcontact', { data: result })
        }
    }

})




app.use((req, res, next) => {
    res.status(404).render('pages/404')
})



app.listen(port, () => {
    console.log(`Serviço Iniciado http://localhost:${port}`)
})


https.createServer(options, app).listen(8888, function () {
    console.log("Working on port 8888");
});


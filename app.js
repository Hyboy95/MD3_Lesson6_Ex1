const http = require('http');
const fs = require('fs');
const qs = require('qs');
const url = require('url');
const handle = {};

const server = http.createServer((req,res) => {
    let urlPath = url.parse(req.url, true).pathname;
    switch(urlPath) {
        case '/':
            handle.getHomePage(req,res).catch(err => console.log(err.message));
            break;
        case '/login':
            if (req.method === "GET") handle.getLoginPage(req,res).catch(err => console.log(err.message));
            else {
                handle.login(req,res).catch(err => console.log(err.message));
            }
            break;
        case '/profile':
            handle.profile(req,res).catch(err => console.log(err.message));
            break;
        default:
            handle.notFound(req,res).catch(err => console.log(err.message));
            break;
    }
})

server.listen(3000, 'localhost', () => console.log('Server is running at http://localhost:3000'));


handle.readFileData = async (filePath) => {
    return new Promise((resolve,reject) => {
        fs.readFile(filePath, 'utf-8', (err, data) => {
            if (err) reject(err);
            resolve(data);
        })
    })
}

handle.writeFileData = async (filePath, data) => {
    return new Promise((resolve,reject) => {
        fs.writeFile(filePath, data, (err) => {
            if (err) reject(err);
            resolve();
        })
    })
}


handle.getHomePage = async (req,res) => {
    let data = await handle.readFileData('./views/home.html');
    res.writeHead(200,{'Content-Type':'text/html'});
    res.write(data);
    res.end();
}

handle.getLoginPage = async (req,res) => {
    let data = await handle.readFileData('./views/login.html');
    res.writeHead(200,{'Content-Type':'text/html'});
    res.write(data);
    res.end();
}


handle.notFound = async (req,res) => {
    let data = await handle.readFileData('./views/notfound.html');
    res.writeHead(200,{'Content-Type':'text/html'});
    res.write(data);
    res.end();
}

handle.login =  async (req,res) => {
    let data = '';
    req.on('data', chunk => {
        data += chunk;
    })
    req.on('end', async () => {
        // let parsedBody = Buffer.concat(data).toString();
        data = qs.parse(data);
        let dataJson = await handle.readFileData('./data.json');
        dataJson = JSON.parse(dataJson.toString());
        let {username, password} = data;
        let userLogin = dataJson.filter(item => item.username === username && item.password === password);
        if (userLogin.length > 0) {
            let nameFileSession = 'user.json';
            await handle.writeFileData('./session/'+ nameFileSession, JSON.stringify(userLogin[0]));
            res.writeHead(301, {location: '/profile'})
            res.end();
        } else {
            res.writeHead(301,{location:'/login'});
            console.log('login fail!');
            res.end();
        }
    })
}

handle.profile = async (req,res) => {
    try {
        let userLogin = await handle.readFileData('./session/user.json');
        let data = await handle.readFileData('./views/profile.html');
        data = data.replace('{username}', JSON.parse(userLogin.toString()).username);
        res.writeHead(200);
        res.write(data);
        res.end();
    }catch (err) {
        res.writeHead(301, {location: '/login'});
        res.end();
    }
}
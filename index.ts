import { Redis } from 'ioredis';
import prompt from 'prompt';

const redis = new Redis();

interface User {
    username?: string;
    fname?: string;
    lname?: string;
    age?: string;
    city?: string;
}

async function main() {

    prompt.start();
    prompt.message = 'wredis';
    prompt.delimiter = ' > ';

    const listCommands = [
        'help',
        'exit',
        'clear',
        'users',
        'lenuser',
        'showuser',
        'adduser'
    ];

    while(true) {
        let { command } = await prompt.get(['command']);

        if (command == "exit") {
            redis.disconnect();
            break;
        } else if (command == "clear") {
                console.clear();
        } else if (command == "users") {
            (await redis.lrange('users', 0, -1)).forEach((value, index) => {
                console.log(`${index}) ${value}`);
            });
        } else if (command == "adduser") {
            prompt.message = 'wredis > adduser';
            let { username, fname, lname, age, city }: User = await prompt.get(['username', 'fname', 'lname', 'age', 'city']);
            prompt.message = 'wredis';
            await redis.rpush('users', username);
            await redis.hset(username, { fname, lname, age, city });
        } else if (command == "showuser") {
            let { username }: User = await prompt.get([{ name: 'username', message: 'showuser' }]);
            const userInfo = await redis.hgetall(username);
            console.log(`username => ${username}`);
            for (const info of Object.entries(userInfo)) {
                console.log(`${info[0]} => ${info[1]}`);
            }
        } else if (command == "userlen") {
            console.log((await redis.llen('users')));
        } else if (command == "help") {
            listCommands.forEach((value, index) => {
                console.log(`${index}) ${value}`);
            });
        } else if (command == "remuser") {
            let { username }: User = await prompt.get([{ name: 'username', message: 'remuser' }]);
            await redis.lrem('users', 1, username);
            await redis.del(username);
        } else {
            console.log('404 : Not Found Command');
        }
    }    
}
main();

import { PrismaClient } from "@prisma/client";
import readline from 'readline';
import { hashPassword } from "./utils/hash";

const prisma = new PrismaClient();

async function createAdmin(username: string, password: string) {
    
    const hashedPassword = await hashPassword(password);

    const admin = await prisma.users.create({
        data: {
            username: username,
            password: hashedPassword,
            permissions: ["admin"],
        },
        select: {
            id: true,
            username: true,
        },
    });

    console.log(`Created admin user with id ${admin.id} and username ${admin.username}`);
}

let rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

rl.question("Username: ", (username) => {
    rl.question("Password: ", (password) => {
        rl.question("Confirm password: ", (confirmPassword) => {
            if (password === confirmPassword) {
                createAdmin(username, password).then(() => {
                    rl.close();
                    process.exit(0);
                });
            } else {
                console.log("Passwords do not match");
                rl.close();
                process.exit(1);
            }
        });
    });
});

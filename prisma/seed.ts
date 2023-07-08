import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
    let updates: any[] = [];
    (await prisma.user.findMany()).map(async user => {
        const update = await prisma.user.update({
            where: { id: user.id },
            data: {
                inbox: {
                    create: {

                    }
                }
            },
        })
        updates.push(update)
    })
    console.log(updates)
}
main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
    let updates: any[] = [];
    (await prisma.phase.findMany()).map(async phase => {
        const update = await prisma.phase.update({
            where: {
                id: phase.id
            },
            data: {
                actions: {
                    create: {

                    }
                }
            }
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
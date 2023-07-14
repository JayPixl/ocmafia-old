import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
    let updates: any[] = [];
    (await prisma.character.findMany()).map(async char => {
        const update = await prisma.character.update({
            where: { id: char.id },
            data: {
                status: 'ACTIVE'
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
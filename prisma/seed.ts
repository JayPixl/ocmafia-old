import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
    let updates: any[] = [];
    (await prisma.gameRoles.findMany()).map(async gameRoles => {
        const update = await prisma.gameRoles.update({
            where: {
                id: gameRoles.id
            },
            data: {
                assignedRoles: {
                    updateMany: {
                        where: {
                            notes: null
                        },
                        data: {
                            notes: ''
                        }
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
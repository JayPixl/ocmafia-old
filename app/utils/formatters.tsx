import { Link } from "@remix-run/react"
import { createElement } from 'react'
import { v4 as uuidv4 } from 'uuid'

export const formatCase: (string: string) => string = (string) => {
    return string[0].toUpperCase() + string.slice(1).toLowerCase()
}

export const formatText: (string: string) => any = (string) => {
    let newString = (string.replace(/^\s*$/g, ' ')).trim()

    let words = newString.split(' ')

    let newArray: any[] = []

    words.map(word => {
        if (/^\@\w+$/.test(word)) {
            let newElement = createElement(Link, { to: `/profile/${word.slice(1)}`, className: 'font-semibold', children: word })
            newArray.push(newElement)
        } else {
            if (typeof newArray[newArray.length - 1] === 'string') {
                newArray[newArray.length - 1] += ` ${word}`
            } else {
                newArray.push(word)
            }
        }
    })

    return <span>
        {newArray.map(elem => <span key={uuidv4()}>{elem} </span>)}
    </span>
}
import { Portal } from './portal'

interface props {
    children: React.ReactNode
    isOpen: boolean
    ariaLabel?: string
    className?: string
    onClick?: (...args: any) => any
}

export const Modal: React.FC<props> = ({ children, isOpen, ariaLabel, className, onClick }) => {
    if (!isOpen) return null

    return (
        <Portal wrapperId="modal">
            <div
                className="fixed inset-0 overflow-y-auto bg-gray-600 bg-opacity-50"
                aria-labelledby={ariaLabel ?? 'modal-title'}
                role="dialog"
                aria-modal="true"
                onClick={onClick}
            ></div>
            <div className="fixed inset-0 pointer-events-none flex justify-center items-center max-h-screen overflow-scroll">
                <div className={`${className} p-4 bg-slate-300 pointer-events-auto max-h-screen rounded-md md:rounded-xl overflow-y-auto text-slate-800`}>
                    {children}
                </div>
            </div>
        </Portal>
    )
}
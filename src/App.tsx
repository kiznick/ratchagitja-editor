import { useEffect, useState } from 'react'
import csv from 'csvtojson'
import './App.css'

import type { File } from './types/File'
import FileItem from './components/FileItem'
import { Document, Page } from 'react-pdf/dist/esm/entry.vite'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'
import 'react-pdf/dist/esm/Page/TextLayer.css'
import MDEditor from '@uiw/react-md-editor'

const storage_is_pass_tutorial = 'k-is-pass-tutorial'

function App() {
    const [fileList, setFileList] = useState<File[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [searchKeywork, setSearchKeywork] = useState<string>('')

    const [currentPdfPageNumber, setCurrentPdfPageNumber] = useState<number>(1)
    const [pdfPageNumber, setPdfPageNumber] = useState<number>(1)
    const [pdfFile, setPdfFile] = useState<string | ArrayBuffer | null>()
    const [isPdfLoading, setPdfLoading] = useState<boolean>(false)

    const [currentFile, setCurrentFile] = useState<File | null>(null)

    const [isOpenFileList, setOpenFileList] = useState<boolean>(true)

    const [mdFile, setMdFile] = useState<string | undefined>('')
    const [isPassTutorial, setIsPassTutorial] = useState<boolean>(true)

    useEffect(() => {
        async function fetchData() {
            const request_folder = fetch('https://api.github.com/repos/narze/ratchagitja.md/git/trees/main')
            const request_filelist = fetch('https://raw.githubusercontent.com/narze/ratchagitja.md/main/data/ratchakitcha.csv')

            const [response_folder, response_filelist] = await Promise.all([request_folder, request_filelist])
            const data_folder = await response_folder.json()
            const document_folder = data_folder.tree.find((item: {
                path: string
                [key: string]: string
            }) => item.path === 'entries')

            const draft_available: string[] = []

            if (document_folder) {
                const request_draft = await fetch(document_folder.url)
                const data_draft = await request_draft.json()
                const draft_md_file = await data_draft.tree.filter((item: {
                    path: string
                    [key: string]: string
                }) => item.path.endsWith('.md'))

                if (draft_md_file) {
                    // loop through all md files
                    await draft_md_file.map(async (item: {
                        path: string
                        [key: string]: string
                    }) => {
                        draft_available.push(item.path.replace('.md', ''))
                    })
                }
            }

            const data_filelist = await response_filelist.text()
            const json = await csv().fromString(data_filelist)

            const modifiedJson: File[] = []
            
            json.map(async (item: File) => {
                if(item['ประเภท'] != 'ก') {
                    return
                }

                if (modifiedJson.length > 99) {
                    return
                }

                if (draft_available.includes((item.URL.split('/').pop() || '').replace('.pdf', ''))) {
                    modifiedJson.unshift({
                        ...item,
                        is_draft: true
                    })
                }

                modifiedJson.push(item)
            })

            setFileList([
                {
                    'id': 'this-is-demo-file',
                    'URL': 'https://cdn.filestackcontent.com/wcrjf9qPTCKXV3hMXDwK',
                    'วันที่': '0',
                    'เรื่อง': 'File for testing only.',
                    'เล่ม': '0',
                    'ตอน': '0',
                    'ประเภท': '0',
                    'หน้า': '0',
                    'เล่มที่': '0',
                },
                ...modifiedJson
            ]) // limit 100
            setIsLoading(false)
        }

        fetchData()

        const is_pass_tutorial = sessionStorage.getItem(storage_is_pass_tutorial)
        if(!is_pass_tutorial) {
            setIsPassTutorial(false)
        }
    }, [])

    if(isLoading) {
        return (
            <div className="flex fixed inset-0 w-screen h-screen">
                <div className="m-auto">
                    <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-slate-400"></div>
                        <div className="text-2xl mt-4">Loading...</div>
                    </div>
                </div>
            </div>
        )
    }

    async function viewPDF(file: File) {
        if(file.id === currentFile?.id) {
            return setOpenFileList(false)
        }
        
        setCurrentFile(file)
        setPdfLoading(true)
        
        const fileName = file.URL.split('/').pop()
        fetch('https://anywhere.ntsd.workers.dev/' + fileName,
            {
                "method": "GET",
                "headers": {
                    "i1ove1oongtoo": "ju5tK1dding"
                }
            }
        ).then(async (response) => {
            if(!response.ok) {
                return response.text().then(text => { throw new Error(text) })
            }

            // covert response to base64
            const blob = await response.blob()
            const reader = new FileReader()
            reader.readAsDataURL(blob)
            reader.onloadend = function() {
                const base64data = reader.result
                setPdfFile(base64data)
                setOpenFileList(false)
                setPdfLoading(false)
            }

            if(file.is_draft) {
                const draft_file = await fetch('https://raw.githubusercontent.com/narze/ratchagitja.md/main/entries/' + (fileName || '').replace('pdf', 'md'))
                if(!draft_file.ok) {
                    return draft_file.text().then(text => { throw new Error(text) })
                }

                const draft_file_text = await draft_file.text()
                setMdFile(draft_file_text)
                alert('This file is draft. It may contain some errors.')
            }

        }).catch(err => {
            setPdfLoading(false)
            console.log('caught it!', err);
            alert('Fetch error: ' + err)
        })

    }

    // function closePDF() {
    //     setPdfFile(null)
    //     setPdfPageNumber(0)
    //     setCurrentPdfPageNumber(0)
    //     setOpenFileList(true)
    //     setCurrentFile(null)
    // }

    function passTutorial() {
        if(isPassTutorial) {
            return
        }

        sessionStorage.setItem(storage_is_pass_tutorial, '1')
        setIsPassTutorial(true)
    }
    
    function generateArrayAroundNumber(num: number, size: number): number[] {
        const outputArray = []
      
        for (let i = num - size; i <= num + size; i++) {
            outputArray.push(i)
        }
      
        return outputArray
    }

    return (
        <div className="container p-4 mx-auto h-screen">
            <div className="grid grid-cols-12 gap-5">

                <div className={`col-span-12 md:col-span-3 ${!isOpenFileList &&  `hidden`}`}>
                    <div className="rounded-xl shadow-xl divide-y my-auto xl:mt-18 bg-slate-800 divide-slate-200/5 h-full">
                        
                        <div className="group relative py-4 px-6 flex">
                            <div className="relative mt-2 mr-4">
                                <button
                                    type="button"
                                    className="inline-flex items-center justify-center p-2 rounded-md text-slate-200 hover:text-white hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-white"
                                    onClick={() => setOpenFileList(false)}
                                >
                                    <span className="sr-only">Close sidebar</span>
                                    <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <div className="relative mt-2 rounded-md shadow-sm w-full">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <span className="text-gray-500 sm:text-sm">
                                        <svg
                                            className="w-6 h-6"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={1.5}
                                            stroke="currentColor"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                                        </svg>
                                    </span>
                                </div>
                                <input
                                    type="text"
                                    name="price"
                                    id="price"
                                    className="block w-full rounded-md border-0 py-2 pl-10 pr-5 text-white ring-1 ring-inset ring-gray-300 placeholder:text-gray-400focus:ring-inset focus:ring-2 focus:ring-blue-500 focus:outline-none sm:text-sm sm:leading-6"
                                    placeholder="Search file..."
                                    onChange={(e) => setSearchKeywork(e.target.value)}
                                />
                            </div>
                        </div>

                        <ul className="divide-y divide-slate-100 max-w-full overflow-y-auto max-h-[80vh]">
                            {fileList.filter((value) => value.เรื่อง.includes(searchKeywork)).map((file) => (
                                <div
                                    key={file.id}
                                    onClick={() => {
                                        viewPDF(file)
                                    }}
                                >
                                    <FileItem
                                        file={file}
                                        searchKeywork={searchKeywork}
                                    />
                                </div>
                            ))}
                        </ul>

                        <div className="group relative py-4 px-6">
                            * Show only 100 files.
                        </div>

                    </div>
                </div>

                <div className={`relative ${isOpenFileList ? `col-span-12 md:col-span-5` : `col-span-12 md:col-span-6 flex justify-end`}`}>
                    {
                        !isOpenFileList && (
                            <div className="absolute top-0 left-0 z-10">
                                <button
                                    className="bg-slate-800 text-white rounded-full px-4 py-2"
                                    onClick={() => setOpenFileList(true)}
                                >
                                    Open file list.
                                </button>
                            </div>
                        )
                    }
                    
                    {
                        isPdfLoading ? (
                            <div className="h-[90.5vh] w-[32vw] flex justify-center items-center bg-white">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-gray-500">Loading...</div>
                                    <div className="text-gray-500">Please wait.</div>
                                </div>
                            </div>
                        ) : (
                            <Document
                                file={pdfFile}
                                onLoadSuccess={({ numPages }) => {
                                    setPdfPageNumber(numPages)
                                    setCurrentPdfPageNumber(1)
                                }}
                                onLoadError={(error) => console.log("Inside Error", error)}
                                className="relative group"
                                noData={
                                    (
                                        <div className="h-[90.5vh] w-[32vw] flex justify-center items-center bg-white">
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-gray-500">No data</div>
                                                <div className="text-gray-500">Please select file to view.</div>
                                            </div>
                                        </div>
                                    )
                                }
                                loading={
                                    (
                                        <div className="h-[90.5vh] w-[32vw] flex justify-center items-center bg-white">
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-gray-500">Loading...</div>
                                                <div className="text-gray-500">Please wait.</div>
                                            </div>
                                        </div>
                                    )
                                }
                            >
                                {
                                    Array.from(generateArrayAroundNumber(currentPdfPageNumber, 3)).map((pageNumber) => {
                                        if(pageNumber < 1 || pageNumber > pdfPageNumber) {
                                            return null
                                        }
        
                                        return (
                                            <Page
                                                key={`page_${pageNumber}`}
                                                pageNumber={pageNumber}
                                                className={`${currentPdfPageNumber != pageNumber && `hidden`}`}
                                                scale={1.034}
                                                onGetTextSuccess={(textItems) => {
                                                    console.log(textItems)
                                                }}
                                            />
                                        )
                                    })
                                }
        
                                <div
                                    className={`absolute ${isOpenFileList ? 'bottom-[32px]' : 'bottom-[64px]'} w-full flex justify-center`}
                                >
                                    <div
                                        className={`group relative inline-flex rounded-md shadow-xl bg-white text-black ${isPassTutorial && `opacity-0 group-hover:opacity-100 transition-opacity`}`}
                                        role="group"
                                        onMouseOut={passTutorial}
                                    >
                                        <button
                                            className="px-4 py-2 rounded-l-md enabled:hover:bg-slate-200 disabled:text-gray-200"
                                            disabled={currentPdfPageNumber == 1}
                                            onClick={() => setCurrentPdfPageNumber(currentPdfPageNumber - 1)}
                                        >
                                            &lt;
                                        </button>
                                        <span className="px-4 py-2">
                                            {currentPdfPageNumber} / {pdfPageNumber}
                                        </span>
                                        <button
                                            className="px-4 py-2 rounded-r-md enabled:hover:bg-slate-200 disabled:text-gray-200"
                                            disabled={currentPdfPageNumber == pdfPageNumber}
                                            onClick={() => setCurrentPdfPageNumber(currentPdfPageNumber + 1)}
                                        >
                                            &gt;
                                        </button>
                                        
                                        {
                                            !isPassTutorial && (
                                                <span
                                                    className="absolute transition-opacity -left-5 -top-2 -translate-y-full w-48 px-2 py-1 bg-gray-700 rounded-lg text-center text-white text-sm after:absolute after:left-1/2 after:top-full after:-translate-x-1/2 after:border-8 after:border-x-transparent after:border-b-transparent after:border-t-gray-700"
                                                >
                                                    Hover to change page.
                                                </span>
                                            )
                                        }
                                    </div>
                                </div>
                            </Document>
                        )
                    }
                </div>

                <div className={`${isOpenFileList ? `col-span-12 md:col-span-4` : `col-span-12 md:col-span-6`}`}>
                    <MDEditor
                        value={mdFile}
                        onChange={(value) => setMdFile(value)}
                        autoFocus={true}
                        height={820}
                    />
                    <div className="text-right">
                        <button
                            className="mt-3 px-4 py-2 rounded bg-indigo-500"
                            onClick={() => {
                                if(!mdFile) {
                                    return
                                }

                                const element = document.createElement("a")
                                const file = new Blob([mdFile], {type: 'text/plain'})
                                element.href = URL.createObjectURL(file)
                                element.download = (currentFile?.เรื่อง || 'file') +'.md'
                                document.body.appendChild(element)
                                element.click()
                            }}
                        >
                            Export Markdown
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default App

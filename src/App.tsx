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
    const [pdfFile, setPdfFile] = useState<any>()
    const [isOpenFileList, setOpenFileList] = useState<boolean>(true)
    const [mdFile, setMdFile] = useState<string | undefined>('**Hello world!!!**')
    const [isPassTutorial, setIsPassTutorial] = useState<boolean>(true)

    useEffect(() => {
        async function fetchData() {
            const response = await fetch('https://raw.githubusercontent.com/narze/ratchagitja.md/main/data/ratchakitcha.csv')
            const data = await response.text()
            const json = await csv().fromString(data)

            setFileList([
                {
                    'id': 'this-is-demo-file',
                    'URL': 'http://localhost:5173/140A015N0000000000100.pdf',
                    'วันที่': '0',
                    'เรื่อง': 'File for testing only.',
                    'เล่ม': '0',
                    'ตอน': '0',
                    'ประเภท': '0',
                    'หน้า': '0',
                    'เล่มที่': '0',
                },
                ...json.slice(0, 99)
            ]) // limit 100
            setIsLoading(false)
        }

        fetchData()
    }, [])

    useEffect(() => {
        const is_pass_tutorial = sessionStorage.getItem(storage_is_pass_tutorial)
        if(!is_pass_tutorial) {
            setIsPassTutorial(false)
        }
    }, [])

    if(isLoading) {
        return <div>Loading...</div>
    }

    async function viewPDF(url: string) {
        const response = await fetch(url)

        // covert response to base64
        const blob = await response.blob()
        const reader = new FileReader()
        reader.readAsDataURL(blob)
        reader.onloadend = function() {
            const base64data = reader.result
            setPdfFile(base64data)
            setOpenFileList(false)
        }

        // setPdfFile(file)
    }

    function closePDF() {
        setPdfFile(null)
        setPdfPageNumber(0)
        setCurrentPdfPageNumber(0)
    }

    function passTutorial() {
        if(isPassTutorial) {
            return
        }

        sessionStorage.setItem(storage_is_pass_tutorial, '1')
        setIsPassTutorial(true)
    }

    return (
        <div className="container p-4 mx-auto h-screen">
            <div className="grid grid-cols-12 gap-5">

                <div className={`col-span-12 md:col-span-3 ${!isOpenFileList &&  `hidden`}`}>
                    <div className="rounded-xl shadow-xl divide-y my-auto xl:mt-18 bg-slate-800 divide-slate-200/5 h-full">
                        
                        <div className="group relative py-4 px-6">
                            <div className="relative mt-2 rounded-md shadow-sm">
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
                                    className="block w-full rounded-md border-0 py-2 pl-10 pr-20 text-white ring-1 ring-inset ring-gray-300 placeholder:text-gray-400focus:ring-inset focus:ring-2 focus:ring-blue-500 focus:outline-none sm:text-sm sm:leading-6"
                                    placeholder="Search file..."
                                    onChange={(e) => setSearchKeywork(e.target.value)}
                                />
                            </div>
                        </div>

                        <ul className="divide-y divide-slate-100 max-w-full overflow-y-auto max-h-[85vh]">
                            {fileList.filter((value) => value.เรื่อง.includes(searchKeywork)).map((file) => (
                                <div
                                    key={file.id}
                                    onClick={() => viewPDF(file.URL)}
                                >
                                    <FileItem
                                        file={file}
                                        searchKeywork={searchKeywork}
                                    />
                                </div>
                            ))}
                        </ul>

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
                    
                    <Document
                        file={pdfFile}
                        onLoadSuccess={({ numPages }) => {
                            setPdfPageNumber(numPages)
                            setCurrentPdfPageNumber(1)
                        }}
                        onLoadError={(error) => console.log("Inside Error", error)}
                        className="relative"
                        // options={{
                        //     cMapUrl: 'cmaps/',
                        //     cMapPacked: true,
                        //     standardFontDataUrl: 'standard_fonts/',
                        // }}
                    >
                        {Array.from(new Array(pdfPageNumber), (el, index) => (
                            currentPdfPageNumber == (index + 1) && (
                                <Page
                                    key={`page_${index + 1}`}
                                    pageNumber={index + 1}
                                    scale={1.034}
                                    onGetTextSuccess={(textItems) => {
                                        console.log(textItems)
                                    }}
                                />
                            )
                        ))}

                        <div
                            className={`absolute ${isOpenFileList ? 'bottom-[32px]' : 'bottom-[64px]'} w-full flex justify-center`}
                        >
                            {/*
                                <button
                                    className="bg-red-500 px-4 py-2 rounded"
                                    onClick={closePDF}
                                >
                                    Close
                                </button>
                            */}

                            <div
                                className={`group relative inline-flex rounded-md shadow-xl bg-white text-black ${isPassTutorial && `opacity-0 hover:opacity-100 transition-opacity`}`}
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
                                            Hover to see more pages
                                        </span>
                                    )
                                }
                            </div>
                        </div>
                    </Document>
                </div>

                <div className={`${isOpenFileList ? `col-span-12 md:col-span-4` : `col-span-12 md:col-span-5`}`}>
                    <MDEditor
                        value={mdFile}
                        onChange={(value) => setMdFile(value)}
                        autoFocus={true}
                        height={900}
                    />
                </div>
            </div>
        </div>
    )
}

export default App

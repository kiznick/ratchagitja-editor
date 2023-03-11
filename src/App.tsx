import { useEffect, useState } from 'react'
import csv from 'csvtojson'
import './App.css'

import type { File } from './types/File'
import FileItem from './components/FileItem'
import { Document, Page } from 'react-pdf/dist/esm/entry.vite'
import MDEditor from '@uiw/react-md-editor';

function App() {
    const [fileList, setFileList] = useState<File[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [searchKeywork, setSearchKeywork] = useState<string>('');

    const [pdfPageNumber, setPdfPageNumber] = useState<number>(1)
    const [pdfFile, setPdfFile] = useState<any>()
    const [mdFile, setMdFile] = useState<string>('**Hello world!!!**');

    useEffect(() => {
        async function fetchData() {
            const response = await fetch('https://raw.githubusercontent.com/narze/ratchagitja.md/main/data/ratchakitcha.csv')
            const data = await response.text()
            const json = await csv().fromString(data)

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
                ...json.slice(0, 99)
            ]) // limit 100
            setIsLoading(false)
        }

        fetchData()
    }, [])

    if(isLoading) {
        return <div>Loading...</div>
    }

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        alert('loaded')
        setPdfPageNumber(numPages)
    }

    const options = {
        cMapUrl: 'cmaps/',
        cMapPacked: true,
        standardFontDataUrl: 'standard_fonts/',
    };

    async function viewPDF(url: string) {
        const response = await fetch(url)

        // covert response to base64
        const blob = await response.blob()
        const reader = new FileReader()
        reader.readAsDataURL(blob)
        reader.onloadend = function() {
            const base64data = reader.result
            setPdfFile(base64data)
        }

        // setPdfFile(file)
    }

    return (
        <div className="container p-4 mx-auto">
            <div className="grid grid-cols-12 gap-5">

                <div className="col-span-12 md:col-span-3">
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

                <div className="col-span-12 md:col-span-5 bg-pink-200 aspect-[1/1.41421]">
                    <Document
                        file={pdfFile}
                        onLoadSuccess={onDocumentLoadSuccess}
                        onLoadError={(error) => console.log("Inside Error", error)}
                        options={options}
                    >
                        {Array.from(new Array(pdfPageNumber), (el, index) => (
                            <Page key={`page_${index + 1}`} pageNumber={index + 1} />
                        ))}
                    </Document>
                </div>

                <div className="col-span-12 md:col-span-4 bg-pink-500">
                    <MDEditor
                        value={mdFile}
                        onChange={(value) => value && setMdFile(value)}
                    />
                </div>
            </div>
        </div>
    )
}

export default App

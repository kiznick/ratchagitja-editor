import Highlighter from "react-highlight-words"
import type { File } from '../types/File'

type Props = {
    file: File
    searchKeywork: string
}

export default function FileItem(props: Props) {
    const { file, searchKeywork } = props

    // id: string /
    // URL: string
    // วันที่: string /
    // เรื่อง: string /
    // เล่ม: string /
    // ตอน: string /
    // ประเภท: string /
    // หน้า: string
    // เล่มที่: string /
    return (
        <article className="flex items-start space-x-6 p-6">
            <img src="http://placekitten.com/120/176" alt="" width="60" height="88" className="flex-none rounded-md bg-slate-100" />
            <div className="min-w-0 relative flex-auto">
                <h2 className="font-semibold text-white" title={file.เรื่อง}>
                    <Highlighter
                        highlightClassName="bg-pink-400 text-white rounded"
                        searchWords={[searchKeywork]}
                        autoEscape={true}
                        textToHighlight={file.เรื่อง}
                    />
                </h2>
                <dl className="mt-2 flex flex-wrap text-sm leading-6 font-medium">
                    <div>
                        <dt className="sr-only">วันที่</dt>
                        <dd className="px-1.5 ring-1 ring-slate-200 rounded">
                            {file.วันที่}
                        </dd>
                    </div>
                    <div className="ml-2">
                        <dt className="sr-only">เล่มที่</dt>
                        <dd>{file.เล่มที่}</dd>
                    </div>
                    <div className="ml-2">
                        <dt className="sr-only">เล่ม</dt>
                        <dd>{file.เล่ม}</dd>
                    </div>
                    <div>
                        <dt className="sr-only">ตอน</dt>
                        <dd className="flex items-center">
                            <svg width="2" height="2" fill="currentColor" className="mx-2 text-slate-300" aria-hidden="true">
                                <circle cx="1" cy="1" r="1" />
                            </svg>
                            {file.ตอน}
                        </dd>
                    </div>
                    <div>
                        <dt className="sr-only">หน้า</dt>
                        <dd className="flex items-center">
                            <svg width="2" height="2" fill="currentColor" className="mx-2 text-slate-300" aria-hidden="true">
                                <circle cx="1" cy="1" r="1" />
                            </svg>
                            {file.หน้า}
                        </dd>
                    </div>
                    <div>
                        <dt className="sr-only">ประเภท</dt>
                        <dd className="flex items-center">
                            <svg width="2" height="2" fill="currentColor" className="mx-2 text-slate-300" aria-hidden="true">
                                <circle cx="1" cy="1" r="1" />
                            </svg>
                            {file.ประเภท}
                        </dd>
                    </div>
                    <div className="flex-none w-full mt-2 font-normal">
                        <dt className="sr-only">Cast</dt>
                        <dd className="text-slate-400 truncate">
                            <a href={file.URL}>
                                {file.URL}
                            </a>
                        </dd>
                    </div>
                </dl>
            </div>
        </article>
    )

}
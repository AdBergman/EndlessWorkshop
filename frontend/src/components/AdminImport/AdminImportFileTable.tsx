import type {
    BulkExportSelectedFile,
    CodexSelectedFile,
} from "./adminImportFileRouting";

type AdminImportFileTableFile = BulkExportSelectedFile | CodexSelectedFile;

function summarizeImportSummary(summary: any | null | undefined): string | null {
    if (!summary?.counts) return null;

    const parts = [
        `received ${summary.counts.received ?? 0}`,
        `inserted ${summary.counts.inserted ?? 0}`,
        `updated ${summary.counts.updated ?? 0}`,
        `unchanged ${summary.counts.unchanged ?? 0}`,
        `deleted ${summary.counts.deleted ?? 0}`,
        `invalid ${summary.counts.failed ?? 0}`,
    ];

    return parts.join(" · ");
}

export default function AdminImportFileTable<TFile extends AdminImportFileTableFile>({
    title,
    files,
    readyDetail,
}: {
    title: string;
    files: TFile[];
    readyDetail: (file: TFile) => string;
}) {
    return (
        <div className="admin-import-section">
            <div style={{ fontWeight: 800, marginBottom: 8 }}>{title}</div>

            <div className="admin-import-tableWrap">
                <table className="admin-import-table">
                    <thead>
                    <tr>
                        <th>Export kind</th>
                        <th>File</th>
                        <th>Status</th>
                        <th>Details</th>
                    </tr>
                    </thead>
                    <tbody>
                    {files.map((file, fileIdx) => (
                        <tr key={`${file.fileName}-${file.exportKind ?? "unknown"}-${fileIdx}`}>
                            <td>{file.exportKind ?? "—"}</td>
                            <td className="admin-import-mono">{file.fileName}</td>
                            <td>
                                <span
                                    className={`admin-import-inlineStatus admin-import-inlineStatus--${file.status}`}
                                >
                                    {file.status.replace("_", " ")}
                                </span>
                            </td>
                            <td className="admin-import-muted">
                                {file.error
                                    ? file.error
                                    : summarizeImportSummary(file.summary) ?? readyDetail(file)}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

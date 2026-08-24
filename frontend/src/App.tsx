import { ChangeEvent, DragEvent, useRef, useState } from "react";
import axios from "axios";
import {
    Copy,
    Download,
    FileText,
    Image as ImageIcon,
    Loader2,
    UploadCloud,
    X,
} from "lucide-react";

import "@/App.css";
import { SummaryResult } from "@/types";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const MAX_SIZE = 10 * 1024 * 1024;

const ACCEPTED = [
    "application/pdf",
    "image/png",
    "image/jpeg",
];

const stages = [
    "Uploading file",
    "Extracting text",
    "Generating summary",
];

export default function App() {
    const inputRef = useRef<HTMLInputElement>(null);

    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState("");
    const [result, setResult] = useState<SummaryResult | null>(null);

    const [activeTab, setActiveTab] =
        useState<keyof SummaryResult["summary"]>("medium");

    const [loadingStage, setLoadingStage] = useState(-1);
    const [error, setError] = useState("");

    const chooseFile = (selected: File | undefined) => {
        if (!selected) return;

        setError("");
        setResult(null);

        if (!ACCEPTED.includes(selected.type)) {
            setError(
                "Unsupported file type. Please choose a PDF, PNG, or JPG image."
            );
            return;
        }

        if (selected.size === 0) {
            setError(
                "This file is empty. Please choose a document with content."
            );
            return;
        }

        if (selected.size > MAX_SIZE) {
            setError(
                "This file is larger than 10 MB. Please choose a smaller document."
            );
            return;
        }

        setFile(selected);
        setPreview(URL.createObjectURL(selected));
    };

    const submit = async () => {
        if (!file) return;

        setError("");
        setLoadingStage(0);

        const form = new FormData();
        form.append("file", file);

        try {
            setLoadingStage(1);

            const response = await axios.post<SummaryResult>(
                `${API}/upload`,
                form,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            setLoadingStage(2);
            setResult(response.data);
            setActiveTab("medium");
        } catch (err: any) {
            setError(
                err.response?.data?.detail ||
                    "Something went wrong while processing your document."
            );
        } finally {
            setLoadingStage(-1);
        }
    };

    const reset = () => {
        setFile(null);
        setPreview("");
        setResult(null);
        setError("");

        if (inputRef.current) {
            inputRef.current.value = "";
        }
    };

    const onDrop = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        chooseFile(event.dataTransfer.files[0]);
    };

    const onInput = (
        event: ChangeEvent<HTMLInputElement>
    ) => {
        chooseFile(event.target.files?.[0]);
    };

    const copySummary = async () => {
        if (!result) return;

        await navigator.clipboard.writeText(
            result.summary[activeTab]
        );
    };

    const download = () => {
        if (!result) return;

        const text = `DOCUMENT SUMMARY
${result.filename}

${activeTab.toUpperCase()} SUMMARY
${result.summary[activeTab]}

KEY POINTS
${result.key_points
    .map((x) => `• ${x}`)
    .join("\n")}

IMPROVEMENT SUGGESTIONS
${result.improvements
    .map((x) => `• ${x}`)
    .join("\n")}`;

        const url = URL.createObjectURL(
            new Blob([text], { type: "text/plain" })
        );

        const anchor = document.createElement("a");

        anchor.href = url;
        anchor.download = `${result.filename.replace(
            /\.[^/.]+$/,
            ""
        )}-summary.txt`;

        anchor.click();

        URL.revokeObjectURL(url);
    };

    return (
        <main
            className="app-shell"
            data-testid="document-summary-app"
        >
            <header className="topbar">
                <div className="brand-mark">
                    <FileText size={18} />
                </div>

                <span data-testid="app-name">
                    Concise.ai
                </span>
            </header>

            <section className="intro">
                <h1 data-testid="page-title">
                    Document Summary
                    <br />
                    <em>Assistant</em>
                </h1>

                <p className="lede">
                    Turn dense documents into clear,
                    useful understanding — in seconds.
                </p>
            </section>

            <section className="workspace">
                <div className="upload-column">
                    <div className="section-heading">
                        <span className="step-number">
                            01
                        </span>

                        <div>
                            <h2>Choose a document</h2>

                            <p>
                                PDFs and images up to
                                10 MB
                            </p>
                        </div>
                    </div>

                    {!file ? (
                        <div
                            className="dropzone"
                            onDrop={onDrop}
                            onDragOver={(e) =>
                                e.preventDefault()
                            }
                            data-testid="upload-dropzone"
                        >
                            <UploadCloud size={30} />

                            <strong>
                                Drop a document here
                            </strong>

                            <span>or</span>

                            <button
                                type="button"
                                onClick={() =>
                                    inputRef.current?.click()
                                }
                                data-testid="choose-file-button"
                            >
                                Browse files
                            </button>

                            <small>
                                PDF · PNG · JPG · JPEG
                            </small>

                            <input
                                ref={inputRef}
                                type="file"
                                accept=".pdf,.png,.jpg,.jpeg"
                                onChange={onInput}
                                data-testid="file-input"
                            />
                        </div>
                    ) : (
                        <div
                            className="file-selected"
                            data-testid="selected-file"
                        >
                            <div className="file-icon">
                                {file.type ===
                                "application/pdf" ? (
                                    <FileText />
                                ) : (
                                    <ImageIcon />
                                )}
                            </div>

                            <div className="file-info">
                                <strong>
                                    {file.name}
                                </strong>

                                <span>
                                    {(
                                        file.size /
                                        1024 /
                                        1024
                                    ).toFixed(2)}{" "}
                                    MB
                                </span>
                            </div>

                            <button
                                className="icon-button"
                                onClick={reset}
                                aria-label="Remove file"
                                data-testid="remove-file-button"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    )}

                    {preview && (
                        <div
                            className="preview"
                            data-testid="document-preview"
                        >
                            <div className="preview-label">
                                Preview
                            </div>

                            {file?.type ===
                            "application/pdf" ? (
                                <iframe
                                    title="PDF preview"
                                    src={preview}
                                    data-testid="pdf-preview"
                                />
                            ) : (
                                <img
                                    src={preview}
                                    alt="Uploaded document preview"
                                    data-testid="image-preview"
                                />
                            )}
                        </div>
                    )}

                    {error && (
                        <div
                            className="error-message"
                            role="alert"
                            data-testid="error-message"
                        >
                            {error}
                        </div>
                    )}

                    {file && !result && (
                        <button
                            className="primary-button"
                            onClick={submit}
                            disabled={
                                loadingStage >= 0
                            }
                            data-testid="generate-summary-button"
                        >
                            {loadingStage >= 0 ? (
                                <>
                                    <Loader2
                                        className="spin"
                                        size={18}
                                    />
                                    Processing
                                </>
                            ) : (
                                <>
                                    Generate summary
                                    <span>↗</span>
                                </>
                            )}
                        </button>
                    )}

                    {loadingStage >= 0 && (
                        <div
                            className="processing"
                            data-testid="processing-state"
                        >
                            <strong>
                                Working through your
                                document
                            </strong>

                            {stages.map(
                                (stage, index) => (
                                    <div
                                        key={stage}
                                        className={
                                            index <=
                                            loadingStage
                                                ? "stage active"
                                                : "stage"
                                        }
                                    >
                                        <span>
                                            {index <
                                            loadingStage ? (
                                                "✓"
                                            ) : index ===
                                              loadingStage ? (
                                                <Loader2
                                                    className="spin"
                                                    size={
                                                        14
                                                    }
                                                />
                                            ) : (
                                                "○"
                                            )}
                                        </span>

                                        {stage}
                                    </div>
                                )
                            )}
                        </div>
                    )}
                </div>

                <div className="results-column">
                    {!result ? (
                        <div
                            className="empty-results"
                            data-testid="empty-results"
                        >
                            <div className="empty-icon">
                                <FileText size={26} />
                            </div>

                            <h2>
                                Your summary will
                                appear here
                            </h2>

                            <p>
                                Upload a document to
                                see its key ideas, a
                                focused summary, and
                                ways to make it even
                                clearer.
                            </p>
                        </div>
                    ) : (
                        <div
                            className="results"
                            data-testid="results-section"
                        >
                            <div className="results-header">
                                <div>
                                    <h2 data-testid="results-title">
                                        {
                                            result.filename
                                        }
                                    </h2>
                                </div>

                                <button
                                    className="text-button"
                                    onClick={reset}
                                    data-testid="start-over-button"
                                >
                                    New document
                                </button>
                            </div>

                            {result.processing_notice && (
                                <div
                                    className="notice"
                                    data-testid="processing-notice"
                                >
                                    {
                                        result.processing_notice
                                    }
                                </div>
                            )}

                            <div className="summary-block">
                                <div className="block-header">
                                    <div>
                                        <p className="eyebrow">
                                            SUMMARY
                                        </p>

                                        <h3>
                                            Choose
                                            your
                                            level of
                                            detail
                                        </h3>
                                    </div>

                                    <div className="actions">
                                        <button
                                            className="secondary-button"
                                            onClick={
                                                copySummary
                                            }
                                            data-testid="copy-summary-button"
                                        >
                                            <Copy
                                                size={
                                                    15
                                                }
                                            />
                                            Copy
                                        </button>

                                        <button
                                            className="secondary-button"
                                            onClick={
                                                download
                                            }
                                            data-testid="download-summary-button"
                                        >
                                            <Download
                                                size={
                                                    15
                                                }
                                            />
                                            Download
                                        </button>
                                    </div>
                                </div>

                                <div
                                    className="tabs"
                                    role="tablist"
                                    data-testid="summary-tabs"
                                >
                                    {(
                                        [
                                            "short",
                                            "medium",
                                            "long",
                                        ] as const
                                    ).map(
                                        (tab) => (
                                            <button
                                                key={
                                                    tab
                                                }
                                                className={
                                                    activeTab ===
                                                    tab
                                                        ? "tab active"
                                                        : "tab"
                                                }
                                                onClick={() =>
                                                    setActiveTab(
                                                        tab
                                                    )
                                                }
                                                role="tab"
                                                aria-selected={
                                                    activeTab ===
                                                    tab
                                                }
                                                data-testid={`${tab}-summary-tab`}
                                            >
                                                {
                                                    tab
                                                }

                                                <span>
                                                    {tab ===
                                                    "short"
                                                        ? "Quick read"
                                                        : tab ===
                                                          "medium"
                                                        ? "Balanced"
                                                        : "Deep dive"}
                                                </span>
                                            </button>
                                        )
                                    )}
                                </div>

                                <p
                                    className="summary-copy"
                                    data-testid="active-summary"
                                >
                                    {
                                        result
                                            .summary[
                                            activeTab
                                        ]
                                    }
                                </p>
                            </div>

                            <div className="insight-grid">
                                <Insight
                                    title="Key points"
                                    items={
                                        result.key_points
                                    }
                                    testId="key-points"
                                />

                                <Insight
                                    title="Improvement suggestions"
                                    items={
                                        result.improvements
                                    }
                                    testId="improvement-suggestions"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </section>

            <footer>
                Your files are processed for
                this request only
            </footer>
        </main>
    );
}

function Insight({
    title,
    items,
    testId,
}: {
    title: string;
    items: string[];
    testId: string;
}) {
    return (
        <section
            className="insight"
            data-testid={testId}
        >
            <p className="eyebrow">
                {title.toUpperCase()}
            </p>

            <ul>
                {items.map((item, index) => (
                    <li
                        key={`${item}-${index}`}
                        data-testid={`${testId}-item-${index}`}
                    >
                        <span>↳</span>
                        {item}
                    </li>
                ))}
            </ul>
        </section>
    );
}
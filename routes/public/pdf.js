import { useEffect } from "react";
import { useParams } from "react-router-dom";

const PdfViewer = () => {
  const { index } = useParams();

  useEffect(() => {
    const loadPdf = async () => {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/pdf/view/${index}`
      );

      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);

      // 🔥 OPEN PDF WITHOUT SHOWING BACKEND URL
      window.location.replace(blobUrl);
    };

    loadPdf();
  }, [index]);

  return <p style={{ textAlign: "center" }}>Loading PDF…</p>;
};

export default PdfViewer;

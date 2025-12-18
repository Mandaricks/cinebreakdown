import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { BreakdownResult } from '../types';

export const generateProductionBible = async (data: BreakdownResult) => {
  // Instância direta do jsPDF (padrão NPM)
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let y = margin;

  // --- COVER PAGE ---
  doc.setFillColor(15, 23, 42); // Slate 900 like
  doc.rect(0, 0, pageWidth, pageHeight, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(32);
  doc.setFont('helvetica', 'bold');
  doc.text(data.title || "PROJETO SEM TÍTULO", pageWidth / 2, pageHeight / 3, { align: 'center' });
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'normal');
  doc.text(`Roteiro por: ${data.author || "Desconhecido"}`, pageWidth / 2, (pageHeight / 3) + 15, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setTextColor(148, 163, 184); // Slate 400
  doc.text("BÍBLIA DE PRODUÇÃO & DECUPAGEM", pageWidth / 2, pageHeight - 30, { align: 'center' });
  doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, pageWidth / 2, pageHeight - 20, { align: 'center' });

  doc.addPage();
  
  // Reset for content pages
  doc.setTextColor(0, 0, 0); 
  y = margin;

  // --- CAST REPORT ---
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text("Relatório de Elenco & Contratos", margin, y);
  y += 10;

  const castBody = data.characters_metadata.map(c => [
    c.name,
    c.role,
    c.actor_name || "TBD",
    c.contract_status || "Pendente",
    c.costume_suggestion.substring(0, 100) + "..."
  ]);

  autoTable(doc, {
    startY: y,
    head: [['Personagem', 'Tipo', 'Ator Sugerido', 'Status Contrato', 'Notas Visuais']],
    body: castBody,
    theme: 'grid',
    headStyles: { fillColor: [79, 70, 229] }, // Indigo
    styles: { fontSize: 9 },
  });

  doc.addPage();
  y = margin;

  // --- SCENE & SHOT LIST (The Breakdown) ---
  doc.setFontSize(18);
  doc.text("Decupagem Técnica (Shot List)", margin, y);
  y += 15;

  for (let i = 0; i < data.scenes.length; i++) {
    const scene = data.scenes[i];
    
    // Check space for Header
    if (y > pageHeight - 40) { doc.addPage(); y = margin; }

    // Scene Header Strip
    doc.setFillColor(30, 41, 59); // Slate 800
    doc.rect(margin, y, pageWidth - (margin * 2), 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`CENA ${scene.scene_number} - ${scene.header} (${scene.time})`, margin + 3, y + 8);
    y += 12;

    // Scene Summary
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    const summaryLines = doc.splitTextToSize(scene.summary, pageWidth - (margin * 2));
    doc.text(summaryLines, margin, y + 5);
    y += (summaryLines.length * 5) + 8;

    // Shots
    if (scene.shots && scene.shots.length > 0) {
      for (const shot of scene.shots) {
        // Space Check (Need enough for image + text)
        if (y > pageHeight - 50) { doc.addPage(); y = margin; }

        const imgHeight = 45; // Fixed height for storyboard frames
        const imgWidth = 45 * (16/9); // Approx ratio
        
        // Draw Image if exists
        if (shot.imageUrl) {
          try {
             doc.addImage(shot.imageUrl, 'JPEG', margin, y, imgWidth, imgHeight);
          } catch (e) {
             doc.rect(margin, y, imgWidth, imgHeight); // Placeholder
             doc.text("Img Error", margin + 10, y + 20);
          }
        } else {
          doc.setDrawColor(200);
          doc.rect(margin, y, imgWidth, imgHeight);
          doc.setFontSize(8);
          doc.text("Sem Imagem", margin + 10, y + 20);
        }

        // Shot Text Info
        const textX = margin + imgWidth + 5;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text(`Shot ${shot.shot_number}: ${shot.size} / ${shot.angle} / ${shot.movement}`, textX, y + 5);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        const descLines = doc.splitTextToSize(shot.description, pageWidth - textX - margin);
        doc.text(descLines, textX, y + 12);
        
        // Technical Details
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.text(`Foco: ${shot.subject}`, textX, y + 12 + (descLines.length * 4) + 4);
        doc.text(`Fundo: ${shot.background_details}`, textX, y + 12 + (descLines.length * 4) + 8);
        doc.setTextColor(0);

        y += imgHeight + 5; // Move cursor down
      }
    } else {
      doc.setFontSize(10);
      doc.setTextColor(150);
      doc.text("(Decupagem técnica ainda não gerada para esta cena)", margin, y + 5);
      y += 15;
    }
    
    y += 10; // Spacing between scenes
  }

  doc.save(`${data.title}_Biblia_Producao.pdf`);
};

export const generateAssetsZip = async (data: BreakdownResult) => {
  const zip = new JSZip();
  const folderImages = zip.folder("Imagens_Decupagem");
  const folderReports = zip.folder("Relatorios_Excel");

  // 1. Add JSON Project File
  zip.file(`${data.title}_Projeto_Completo.json`, JSON.stringify(data, null, 2));

  // 2. Generate CSVs
  const castCSV = [
    "Personagem,Ator Sugerido,Papel,Status Contrato,Figurino",
    ...data.characters_metadata.map(c => 
      `"${c.name}","${c.actor_name || ''}","${c.role}","${c.contract_status || ''}","${c.costume_suggestion.replace(/"/g, '""')}"`
    )
  ].join('\n');
  folderReports?.file("Elenco_Contratos.csv", castCSV);

  const scenesCSV = [
    "Cena,Locacao,Periodo,Resumo,Personagens",
    ...data.scenes.map(s => 
      `${s.scene_number},"${s.location}","${s.time}","${s.summary.replace(/"/g, '""')}","${s.characters.join(', ')}"`
    )
  ].join('\n');
  folderReports?.file("Cronograma_Cenas.csv", scenesCSV);

  // 3. Extract Images
  let imgCount = 0;
  
  // Scene Master Images
  data.scenes.forEach(scene => {
    if (scene.sceneImageUrl) {
      const base64Data = scene.sceneImageUrl.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");
      folderImages?.file(`Cena_${scene.scene_number}_Master.jpg`, base64Data, {base64: true});
      imgCount++;
    }
    // Shot Images
    if (scene.shots) {
      scene.shots.forEach(shot => {
        if (shot.imageUrl) {
          const base64Data = shot.imageUrl.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");
          folderImages?.file(`Cena_${scene.scene_number}_Shot_${shot.shot_number}.jpg`, base64Data, {base64: true});
          imgCount++;
        }
      });
    }
  });

  // Generate and Download
  const content = await zip.generateAsync({type:"blob"});
  saveAs(content, `${data.title}_Pacote_Producao.zip`);
  return imgCount;
};
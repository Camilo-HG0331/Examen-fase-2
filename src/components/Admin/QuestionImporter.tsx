import React, { useState } from 'react';
import { Question } from '../../types';
import {
  Upload,
  FileJson,
  FileText,
  Sparkles,
  Download,
  CheckCircle2,
  AlertCircle,
  Eye,
  Check,
  Cpu,
  Calculator,
  BookOpen,
  HeartHandshake,
} from 'lucide-react';

interface QuestionImporterProps {
  onImportSuccess: () => void;
}

export const QuestionImporter: React.FC<QuestionImporterProps> = ({ onImportSuccess }) => {
  const [activeTab, setActiveTab] = useState<'json' | 'pdf'>('json');

  // JSON state
  const [jsonText, setJsonText] = useState('');
  const [jsonQuestions, setJsonQuestions] = useState<Question[] | null>(null);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [isImportingJson, setIsImportingJson] = useState(false);
  const [jsonSuccessMsg, setJsonSuccessMsg] = useState<string | null>(null);

  // PDF / AI state
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  const [rawTextSyllabus, setRawTextSyllabus] = useState('');
  const [isProcessingAi, setIsProcessingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiSuccessMsg, setAiSuccessMsg] = useState<string | null>(null);
  const [aiExtractedQuestions, setAiExtractedQuestions] = useState<Question[]>([]);

  // Sample JSON download template
  const downloadSampleJson = () => {
    const sample = [
      {
        category: 'logica',
        title: 'Análisis de tabla de verdad AND en control de acceso',
        context: 'Un microservicio valida dos condiciones booleanas: condicionA y condicionB.',
        options: [
          'Verdadero solo si ambas son Verdaderas',
          'Verdadero si al menos una es Verdadera',
          'Falso solo si ambas son Verdaderas',
          'Indeterminado'
        ],
        correctAnswer: 0,
        explanation: 'El operador lógico AND exige que ambos operandos sean verdaderos para evaluar a verdadero.',
        difficulty: 'facil',
        targetGroup: 'ALL'
      },
      {
        category: 'matematicas',
        title: 'Cálculo de descuento en licencia de software',
        context: 'Una licencia corporativa cuesta $400 USD con un 15% de descuento por pronto pago.',
        options: ['$340 USD', '$360 USD', '$350 USD', '$380 USD'],
        correctAnswer: 0,
        explanation: '400 * 0.15 = 60. 400 - 60 = 340 USD.',
        difficulty: 'facil',
        targetGroup: 'ALL'
      },
      {
        category: 'comprension',
        title: 'Identificación de requerimiento no funcional',
        context: 'El sistema debe procesar transacciones en menos de 200 milisegundos con 5.000 usuarios concurrentes.',
        options: [
          'Requerimiento No Funcional de Rendimiento',
          'Requerimiento Funcional de Facturación',
          'Regla de negocio contable',
          'Caso de uso de usuario'
        ],
        correctAnswer: 0,
        explanation: 'Las restricciones de velocidad, tiempo de respuesta y escalabilidad son requerimientos no funcionales.',
        difficulty: 'medio',
        targetGroup: 'ALL'
      },
      {
        category: 'psicologico',
        title: 'Aceptación de retroalimentación en revisión de código',
        context: 'En un Pull Request, el líder técnico te solicita refactorizar una función porque no cumple con principios SOLID.',
        options: [
          'Agradecer las observaciones, analizar los principios indicados y refactorizar el código con pruebas unitarias.',
          'Ignorar el comentario y hacer merge directamente al branch principal.',
          'Discutir agresivamente argumentando que el código funciona y la estética no importa.',
          'Dejar el proyecto sin avisar.'
        ],
        correctAnswer: 0,
        explanation: 'La apertura al aprendizaje y el apego a buenas prácticas de ingeniería de software definen el perfil idóneo.',
        difficulty: 'facil',
        targetGroup: 'ALL'
      }
    ];

    const blob = new Blob([JSON.stringify(sample, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plantilla-preguntas-adso-fase2.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Validate JSON string
  const handleValidateJson = (text: string) => {
    setJsonText(text);
    setJsonError(null);
    setJsonSuccessMsg(null);

    if (!text.trim()) {
      setJsonQuestions(null);
      return;
    }

    try {
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed)) {
        setJsonError('El contenido debe ser un arreglo de preguntas JSON [...]');
        setJsonQuestions(null);
        return;
      }
      setJsonQuestions(parsed);
    } catch (err: any) {
      setJsonError(`Error de sintaxis JSON: ${err.message}`);
      setJsonQuestions(null);
    }
  };

  // Handle JSON file upload
  const handleJsonFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      handleValidateJson(content);
    };
    reader.readAsText(file);
  };

  // Commit JSON import
  const handleCommitJsonImport = async () => {
    if (!jsonQuestions || jsonQuestions.length === 0) return;
    setIsImportingJson(true);
    setJsonError(null);
    try {
      const res = await fetch('/api/questions/import-json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions: jsonQuestions }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al importar');
      setJsonSuccessMsg(`¡${data.count} preguntas importadas exitosamente! Total en banco: ${data.total}`);
      setJsonQuestions(null);
      setJsonText('');
      onImportSuccess();
    } catch (err: any) {
      setJsonError(err.message || 'Error al importar');
    } finally {
      setIsImportingJson(false);
    }
  };

  // Handle PDF file selection & conversion to base64
  const handlePdfFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setAiError('Por favor seleccione un archivo en formato PDF.');
      return;
    }

    setPdfFile(file);
    setAiError(null);
    setAiSuccessMsg(null);

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Extract base64 without prefix
      const base64Data = result.split(',')[1] || result;
      setPdfBase64(base64Data);
    };
    reader.readAsDataURL(file);
  };

  // Run AI PDF extraction
  const handleRunAiExtraction = async () => {
    if (!pdfBase64 && !rawTextSyllabus.trim()) {
      setAiError('Debe adjuntar un archivo PDF o ingresar texto del examen.');
      return;
    }

    setIsProcessingAi(true);
    setAiError(null);
    setAiSuccessMsg(null);

    try {
      const res = await fetch('/api/questions/import-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base64Data: pdfBase64,
          mimeType: 'application/pdf',
          textContent: rawTextSyllabus.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || data.details || 'Fallo en la extracción de preguntas por IA');
      }

      setAiExtractedQuestions(data.questions || []);
      setAiSuccessMsg(
        `¡Extracción exitosa! ${data.extractedCount} preguntas fueron analizadas, clasificadas e incorporadas al banco en la nube.`
      );
      setPdfFile(null);
      setPdfBase64(null);
      setRawTextSyllabus('');
      onImportSuccess();
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || 'Error al procesar el archivo con inteligencia artificial.');
    } finally {
      setIsProcessingAi(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden">
      {/* Tab bar */}
      <div className="border-b border-gray-200 bg-gray-50 px-6 pt-4 flex space-x-6 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab('json')}
          className={`pb-3 border-b-2 flex items-center space-x-2 transition-colors ${
            activeTab === 'json'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <FileJson className="w-4 h-4 text-emerald-600" />
          <span>Importar Archivo JSON</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('pdf')}
          className={`pb-3 border-b-2 flex items-center space-x-2 transition-colors ${
            activeTab === 'pdf'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span>Importar PDF con IA (Gemini 2.5 Flash)</span>
        </button>
      </div>

      <div className="p-6 sm:p-8">
        {activeTab === 'json' ? (
          /* JSON IMPORT SECTION */
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div>
                <h4 className="text-sm font-bold text-gray-900">Carga Masiva de Preguntas en JSON</h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  Suba un archivo estructurado con preguntas de Lógica, Matemáticas, Comprensión y Psicológico.
                </p>
              </div>
              <button
                type="button"
                onClick={downloadSampleJson}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 text-xs font-semibold shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar Plantilla JSON</span>
              </button>
            </div>

            {/* File drop / upload */}
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-700 mb-2">
                Seleccione archivo .json
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-emerald-500 transition-colors bg-gray-50/50">
                <FileJson className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <label className="cursor-pointer">
                  <span className="text-xs font-bold text-emerald-700 hover:underline">
                    Haga clic para examinar
                  </span>
                  <span className="text-xs text-gray-500"> o arrastre el archivo aquí</span>
                  <input
                    type="file"
                    accept=".json,application/json"
                    onChange={handleJsonFileUpload}
                    className="hidden"
                  />
                </label>
                <p className="text-[11px] text-gray-400 mt-1">Formato JSON válido UTF-8</p>
              </div>
            </div>

            {/* Paste JSON */}
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-700 mb-1">
                O pegue el contenido JSON directamente:
              </label>
              <textarea
                rows={6}
                placeholder="[ { &quot;category&quot;: &quot;logica&quot;, &quot;title&quot;: &quot;...&quot;, &quot;options&quot;: [&quot;A&quot;,&quot;B&quot;,&quot;C&quot;,&quot;D&quot;], &quot;correctAnswer&quot;: 0 } ]"
                value={jsonText}
                onChange={(e) => handleValidateJson(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg font-mono text-xs focus:bg-white focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            {/* Error or Success banners */}
            {jsonError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{jsonError}</span>
              </div>
            )}

            {jsonSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{jsonSuccessMsg}</span>
              </div>
            )}

            {/* Validation Preview */}
            {jsonQuestions && (
              <div className="space-y-3 p-4 bg-emerald-50/50 border border-emerald-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs font-bold text-emerald-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Se detectaron {jsonQuestions.length} preguntas válidas listas para importar.</span>
                  </div>
                  <button
                    type="button"
                    disabled={isImportingJson}
                    onClick={handleCommitJsonImport}
                    className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors shadow-xs disabled:opacity-50"
                  >
                    <span>{isImportingJson ? 'Importando...' : 'Confirmar e Importar al Banco'}</span>
                  </button>
                </div>

                <div className="max-h-48 overflow-y-auto space-y-1.5 text-xs text-gray-700">
                  {jsonQuestions.slice(0, 5).map((q, idx) => (
                    <div key={idx} className="p-2 bg-white rounded border border-gray-200 flex justify-between">
                      <span className="truncate max-w-md font-medium">#{idx + 1}. {q.title}</span>
                      <span className="text-[11px] text-gray-500 font-bold uppercase">{q.category}</span>
                    </div>
                  ))}
                  {jsonQuestions.length > 5 && (
                    <p className="text-[11px] text-gray-500 italic text-center">
                      ... y {jsonQuestions.length - 5} preguntas más.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* PDF / AI IMPORT SECTION */
          <div className="space-y-6">
            <div className="bg-purple-50/60 p-4 rounded-lg border border-purple-200 flex items-start space-x-3">
              <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <h4 className="font-bold text-purple-950">
                  Extracción Inteligente con Gemini 2.5 Flash
                </h4>
                <p className="text-purple-900/80 mt-1 leading-relaxed">
                  Cargue cualquier examen anterior, guía de aprendizaje o documento técnico en PDF.
                  La IA analiza el contenido, clasifica automáticamente cada pregunta en las 4 áreas del SENA ADSO
                  (Lógica, Matemáticas, Comprensión y Psicológico), genera opciones y explicaciones, y las añade a la nube.
                </p>
              </div>
            </div>

            {/* PDF Upload Input */}
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-700 mb-2">
                Subir Documento PDF (.pdf)
              </label>
              <div className="border-2 border-dashed border-purple-300 rounded-xl p-6 text-center hover:border-purple-600 transition-colors bg-purple-50/20">
                <FileText className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <label className="cursor-pointer">
                  <span className="text-xs font-bold text-purple-700 hover:underline">
                    Seleccionar Archivo PDF
                  </span>
                  <span className="text-xs text-gray-500"> o arrástrelo a esta zona</span>
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handlePdfFileSelect}
                    className="hidden"
                  />
                </label>
                {pdfFile ? (
                  <div className="mt-3 inline-flex items-center space-x-2 px-3 py-1 rounded bg-purple-100 text-purple-900 text-xs font-semibold">
                    <Check className="w-3.5 h-3.5" />
                    <span>{pdfFile.name} ({(pdfFile.size / 1024).toFixed(1)} KB)</span>
                  </div>
                ) : (
                  <p className="text-[11px] text-gray-400 mt-1">Guías SENA, talleres de lógica, simulacros ADSO</p>
                )}
              </div>
            </div>

            {/* Or Paste Raw Text */}
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-700 mb-1">
                O pegue fragmentos de texto del temario / taller:
              </label>
              <textarea
                rows={4}
                placeholder="Pegue aquí el texto de las preguntas, enunciados o temas que desea transformar en examen oficial..."
                value={rawTextSyllabus}
                onChange={(e) => setRawTextSyllabus(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg text-xs focus:bg-white focus:ring-1 focus:ring-purple-600"
              />
            </div>

            {/* Error and Success banners */}
            {aiError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{aiError}</span>
              </div>
            )}

            {aiSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{aiSuccessMsg}</span>
              </div>
            )}

            {/* AI Action Button */}
            <div className="flex justify-end">
              <button
                type="button"
                disabled={isProcessingAi || (!pdfBase64 && !rawTextSyllabus.trim())}
                onClick={handleRunAiExtraction}
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-lg bg-purple-700 hover:bg-purple-800 text-white text-xs sm:text-sm font-bold shadow-xs transition-all disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isProcessingAi ? 'Procesando con Gemini AI...' : 'Analizar y Extraer Preguntas con IA'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

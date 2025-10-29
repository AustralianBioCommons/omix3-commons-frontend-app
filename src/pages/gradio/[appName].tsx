// src/pages/gradio/[appName].tsx
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Loading from '@/components/Loading';

const GradioApp = () => {
  const router = useRouter();
  const { appName } = router.query;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, [appName]);

  if (loading || !appName) {
    return <Loading />;
  }

  return (
    <div style={{ 
      width: '100%', 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      background: '#f5f5f5'
    }}>
      {/* Header */}
      <div style={{
        padding: '20px 30px',
        background: 'white',
        borderBottom: '1px solid #e0e0e0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', color: '#333' }}>
            {formatAppName(appName as string)}
          </h1>
          <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '14px' }}>
            AI-powered analysis tool
          </p>
        </div>
        <button
          onClick={() => router.push('/Analysis')}
          style={{
            padding: '8px 16px',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          ← Back to Analysis
        </button>
      </div>

      {/* Content Area */}
      <div style={{ 
        flex: 1, 
        padding: '20px',
        overflow: 'auto'
      }}>
        <GradioAppContent appName={appName as string} />
      </div>
    </div>
  );
};

// Component to render specific app content
const GradioAppContent = ({ appName }: { appName: string }) => {
  switch (appName) {
    case 'uc-ctds-gdc-qag':
      return <QAGApp />;
    case 'uc-ctds-gdc-cohort-copilot':
      return <CohortCopilotApp />;
    case 'uc-ctds-llama-data-model-generator-demo':
      return <DataModelGeneratorApp />;
    default:
      return <DefaultApp appName={appName} />;
  }
};

// Sample QAG App
const QAGApp = () => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulate AI processing
    setTimeout(() => {
      setAnswer(`Based on your query "${question}", here are the relevant cohorts:\n\n• Cohort 1: Patients with matching criteria (n=150)\n• Cohort 2: Control group (n=200)\n• Cohort 3: Treatment group (n=175)\n\nConfidence: 87%`);
      setIsProcessing(false);
    }, 2000);
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{
        background: 'white',
        padding: '30px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ marginTop: 0, color: '#333' }}>GDC Question Answering Generator</h2>
        <p style={{ color: '#666', marginBottom: '30px' }}>
          Ask questions about genomic data and get AI-generated cohort recommendations.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: 'bold',
              color: '#333'
            }}>
              Enter your question:
            </label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g., Find patients with lung cancer and TP53 mutations..."
              style={{
                width: '100%',
                minHeight: '100px',
                padding: '12px',
                borderRadius: '4px',
                border: '1px solid #ddd',
                fontSize: '14px',
                fontFamily: 'inherit'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={!question.trim() || isProcessing}
            style={{
              padding: '12px 24px',
              background: isProcessing ? '#ccc' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            {isProcessing ? 'Processing...' : 'Generate Answer'}
          </button>
        </form>

        {answer && (
          <div style={{
            marginTop: '30px',
            padding: '20px',
            background: '#f8f9fa',
            borderRadius: '4px',
            borderLeft: '4px solid #28a745'
          }}>
            <h3 style={{ marginTop: 0, color: '#333' }}>Results:</h3>
            <pre style={{ 
              whiteSpace: 'pre-wrap', 
              color: '#555',
              fontFamily: 'inherit',
              margin: 0 
            }}>
              {answer}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

// Sample Cohort Copilot App
const CohortCopilotApp = () => {
  const [description, setDescription] = useState('');
  const [cohort, setCohort] = useState<any>(null);

  const handleGenerate = () => {
    setCohort({
      name: 'AI Generated Cohort',
      criteria: [
        'Age: 45-65 years',
        'Diagnosis: Primary tumor',
        'Stage: II-III',
        'Treatment: Chemotherapy'
      ],
      estimatedSize: 342,
      filters: {
        age: { min: 45, max: 65 },
        stage: ['II', 'III'],
        treatment: ['Chemotherapy']
      }
    });
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{
        background: 'white',
        padding: '30px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ marginTop: 0, color: '#333' }}>Cohort Copilot</h2>
        <p style={{ color: '#666', marginBottom: '30px' }}>
          Describe your cohort criteria in natural language and let AI build the query.
        </p>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: 'bold',
            color: '#333'
          }}>
            Describe your cohort:
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., Middle-aged patients with stage 2 or 3 primary tumors who received chemotherapy..."
            style={{
              width: '100%',
              minHeight: '120px',
              padding: '12px',
              borderRadius: '4px',
              border: '1px solid #ddd',
              fontSize: '14px',
              fontFamily: 'inherit'
            }}
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={!description.trim()}
          style={{
            padding: '12px 24px',
            background: description.trim() ? '#007bff' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: description.trim() ? 'pointer' : 'not-allowed',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          Generate Cohort
        </button>

        {cohort && (
          <div style={{ marginTop: '30px' }}>
            <div style={{
              padding: '20px',
              background: '#e7f3ff',
              borderRadius: '4px',
              borderLeft: '4px solid #007bff'
            }}>
              <h3 style={{ marginTop: 0, color: '#333' }}>{cohort.name}</h3>
              <p style={{ color: '#666', fontWeight: 'bold' }}>
                Estimated cohort size: {cohort.estimatedSize} patients
              </p>
              <h4 style={{ color: '#333' }}>Criteria:</h4>
              <ul style={{ color: '#555' }}>
                {cohort.criteria.map((criterion: string, i: number) => (
                  <li key={i}>{criterion}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Sample Data Model Generator
const DataModelGeneratorApp = () => {
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState('');

  const handleGenerate = () => {
    setModel(`{
  "title": "Clinical Data Model",
  "type": "object",
  "properties": {
    "patient_id": {
      "type": "string",
      "description": "Unique patient identifier"
    },
    "diagnosis": {
      "type": "string",
      "description": "Primary diagnosis"
    },
    "treatment_date": {
      "type": "string",
      "format": "date",
      "description": "Date of treatment initiation"
    },
    "biomarkers": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "List of relevant biomarkers"
    }
  },
  "required": ["patient_id", "diagnosis"]
}`);
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{
        background: 'white',
        padding: '30px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ marginTop: 0, color: '#333' }}>Data Model Generator</h2>
        <p style={{ color: '#666', marginBottom: '30px' }}>
          Generate JSON data models from natural language descriptions.
        </p>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: 'bold',
            color: '#333'
          }}>
            Describe your data model:
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., A clinical data model with patient ID, diagnosis, treatment date, and biomarkers..."
            style={{
              width: '100%',
              minHeight: '100px',
              padding: '12px',
              borderRadius: '4px',
              border: '1px solid #ddd',
              fontSize: '14px',
              fontFamily: 'inherit'
            }}
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={!prompt.trim()}
          style={{
            padding: '12px 24px',
            background: prompt.trim() ? '#6f42c1' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: prompt.trim() ? 'pointer' : 'not-allowed',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          Generate Model
        </button>

        {model && (
          <div style={{ marginTop: '30px' }}>
            <h3 style={{ color: '#333' }}>Generated Data Model:</h3>
            <pre style={{
              padding: '20px',
              background: '#f8f9fa',
              borderRadius: '4px',
              border: '1px solid #ddd',
              overflow: 'auto',
              fontSize: '13px',
              color: '#333'
            }}>
              {model}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

// Default fallback app
const DefaultApp = ({ appName }: { appName: string }) => {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{
        background: 'white',
        padding: '30px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        textAlign: 'center'
      }}>
        <h2 style={{ color: '#333' }}>{formatAppName(appName)}</h2>
        <p style={{ color: '#666', marginTop: '20px' }}>
          This application is currently under development.
        </p>
      </div>
    </div>
  );
};

// Helper function to format app names
const formatAppName = (appName: string): string => {
  return appName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export default GradioApp;

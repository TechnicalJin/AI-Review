from flask import Flask, request, jsonify
from flask_cors import CORS
from faster_whisper import WhisperModel
import os
import tempfile
import logging
from werkzeug.utils import secure_filename

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests from your Java app

# Allowed audio formats
ALLOWED_EXTENSIONS = {'webm', 'wav', 'mp3', 'm4a', 'ogg'}

# Load BASE model once at startup (this takes 10-20 seconds)
logger.info("🔄 Loading Faster-Whisper BASE model...")
try:
    model = WhisperModel(
        "base",
        device="cpu",
        compute_type="int8",
        download_root=None  # Uses cache directory
    )
    logger.info("✅ BASE model loaded successfully!")
except Exception as e:
    logger.error(f"❌ Failed to load model: {e}")
    raise

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model': 'base',
        'service': 'whisper-service',
        'version': '1.0.0'
    }), 200

@app.route('/transcribe', methods=['POST'])
def transcribe():
    """
    Transcribe audio file to text
    
    Expected form data:
    - audio: audio file (required)
    - language: language code (optional, auto-detect if not provided)
    
    Returns JSON:
    {
        "success": true,
        "text": "transcribed text",
        "language": "detected language",
        "language_probability": 0.95,
        "duration": 10.5
    }
    """
    try:
        # Validate request
        if 'audio' not in request.files:
            return jsonify({
                'success': False,
                'error': 'No audio file provided'
            }), 400
        
        audio_file = request.files['audio']
        
        # Check if file is selected
        if audio_file.filename == '':
            return jsonify({
                'success': False,
                'error': 'No file selected'
            }), 400
        
        # Validate file extension
        if not allowed_file(audio_file.filename):
            return jsonify({
                'success': False,
                'error': f'Invalid file type. Allowed: {ALLOWED_EXTENSIONS}'
            }), 400
        
        # Get optional language parameter
        language = request.form.get('language', None)
        if language and language.lower() == 'auto':
            language = None
        
        logger.info(f"📝 Processing file: {audio_file.filename}")
        
        # Save to temporary file
        filename = secure_filename(audio_file.filename)
        temp_fd, temp_path = tempfile.mkstemp(suffix=os.path.splitext(filename)[1])
        
        try:
            # Write audio data
            with os.fdopen(temp_fd, 'wb') as f:
                audio_file.save(f)
            
            logger.info(f"🎤 Transcribing with language: {language or 'auto-detect'}")
            
            # Transcribe using BASE model
            segments, info = model.transcribe(
                temp_path,
                language=language,
                vad_filter=True,  # Voice Activity Detection
                vad_parameters=dict(
                    threshold=0.5,
                    min_speech_duration_ms=250
                )
            )
            
            # Collect all segments
            text_segments = []
            for segment in segments:
                text_segments.append(segment.text.strip())
            
            # Join segments
            final_text = " ".join(text_segments).strip()
            
            logger.info(f"✅ Transcription complete: {len(final_text)} chars")
            
            # Prepare response
            response = {
                'success': True,
                'text': final_text,
                'language': info.language,
                'language_probability': round(info.language_probability, 4),
                'duration': round(info.duration, 2) if hasattr(info, 'duration') else 0
            }
            
            return jsonify(response), 200
            
        finally:
            # Always cleanup temp file
            try:
                os.unlink(temp_path)
            except:
                pass
    
    except Exception as e:
        logger.error(f"❌ Transcription error: {str(e)}", exc_info=True)
        return jsonify({
            'success': False,
            'error': f'Transcription failed: {str(e)}'
        }), 500

@app.route('/models', methods=['GET'])
def list_models():
    """List available models"""
    return jsonify({
        'current_model': 'base',
        'available_models': ['tiny', 'base', 'small', 'medium', 'large'],
        'recommended': 'base'
    }), 200

if __name__ == '__main__':
    logger.info("🚀 Starting Whisper Service on http://localhost:5000")
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True  # Set to False in production
    )
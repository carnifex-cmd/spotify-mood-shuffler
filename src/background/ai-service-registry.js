/**
 * AI Service Registry
 * Manages the selection and instantiation of AI services (Gemini vs Perplexity)
 */

import GeminiFlashService from './gemini-flash.js';
import PerplexityService from './perplexity.js';

export default function AIServiceRegistry() {
    const SUPPORTED_SERVICES = {
        GEMINI: 'gemini',
        PERPLEXITY: 'perplexity'
    };

    /**
     * Creates and returns the appropriate AI service based on configuration
     * @param {string} serviceName - The name of the service to use ('gemini' or 'perplexity')
     * @returns {Object} AI service instance with getSongs method
     */
    function createService(serviceName) {
        const service = serviceName?.toLowerCase() || SUPPORTED_SERVICES.GEMINI;
        
        console.log(`AI Service Registry: Creating ${service} service`);
        
        switch (service) {
            case SUPPORTED_SERVICES.GEMINI:
                console.log('AI Service Registry: Using Gemini Flash service');
                return GeminiFlashService();
                
            case SUPPORTED_SERVICES.PERPLEXITY:
                console.log('AI Service Registry: Using Perplexity service');
                return PerplexityService();
                
            default:
                console.warn(`AI Service Registry: Unknown service '${service}', falling back to Gemini`);
                return GeminiFlashService();
        }
    }

    /**
     * Get list of supported AI services
     * @returns {Object} Object with supported service names
     */
    function getSupportedServices() {
        return { ...SUPPORTED_SERVICES };
    }

    /**
     * Validate if a service name is supported
     * @param {string} serviceName - The service name to validate
     * @returns {boolean} True if service is supported
     */
    function isServiceSupported(serviceName) {
        if (!serviceName) return false;
        return Object.values(SUPPORTED_SERVICES).includes(serviceName.toLowerCase());
    }

    return {
        createService,
        getSupportedServices,
        isServiceSupported,
        SUPPORTED_SERVICES
    };
}

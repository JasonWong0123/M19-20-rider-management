/**
 * Data Store Service
 * 
 * Purpose: Provides JSON file-based data persistence with in-memory caching
 * 
 * Features:
 * - Read/Write JSON files synchronously and asynchronously
 * - In-memory cache for fast data access
 * - Automatic file creation if not exists
 * - Error handling for file operations
 * 
 * Design Decision: Using synchronous file operations for simplicity in demo phase.
 * For production, consider async operations to avoid blocking the event loop.
 */

const fs = require('fs');
const path = require('path');

class DataStore {
  constructor() {
    // In-memory cache to reduce file I/O operations
    this.cache = {};
    
    // Data directory path
    this.dataDir = path.join(__dirname, '..', 'data');
    
    // Ensure data directory exists
    this.ensureDataDirectory();
  }

  /**
   * Ensure the data directory exists, create if not
   */
  ensureDataDirectory() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
      console.log(`[DataStore] Created data directory: ${this.dataDir}`);
    }
  }

  /**
   * Get the full file path for a data file
   * @param {string} filename - Name of the data file
   * @returns {string} Full file path
   */
  getFilePath(filename) {
    return path.join(this.dataDir, filename);
  }

  /**
   * Read data from JSON file
   * @param {string} filename - Name of the JSON file
   * @param {*} defaultValue - Default value if file doesn't exist
   * @returns {*} Parsed JSON data
   */
  read(filename, defaultValue = null) {
    try {
      // Check cache first
      if (this.cache[filename]) {
        console.log(`[DataStore] Cache hit for: ${filename}`);
        return this.cache[filename];
      }

      const filePath = this.getFilePath(filename);
      
      // If file doesn't exist, return default value
      if (!fs.existsSync(filePath)) {
        console.log(`[DataStore] File not found: ${filename}, using default value`);
        return defaultValue;
      }

      // Read and parse JSON file
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(fileContent);
      
      // Update cache
      this.cache[filename] = data;
      
      console.log(`[DataStore] Read from file: ${filename}`);
      return data;
    } catch (error) {
      console.error(`[DataStore] Error reading file ${filename}:`, error.message);
      return defaultValue;
    }
  }

  /**
   * Write data to JSON file
   * @param {string} filename - Name of the JSON file
   * @param {*} data - Data to write
   * @returns {boolean} Success status
   */
  write(filename, data) {
    try {
      const filePath = this.getFilePath(filename);
      
      // Convert data to formatted JSON string
      const jsonContent = JSON.stringify(data, null, 2);
      
      // Write to file
      fs.writeFileSync(filePath, jsonContent, 'utf8');
      
      // Update cache
      this.cache[filename] = data;
      
      console.log(`[DataStore] Written to file: ${filename}`);
      return true;
    } catch (error) {
      console.error(`[DataStore] Error writing file ${filename}:`, error.message);
      return false;
    }
  }

  /**
   * Clear cache for a specific file or all files
   * @param {string|null} filename - File to clear from cache, or null for all
   */
  clearCache(filename = null) {
    if (filename) {
      delete this.cache[filename];
      console.log(`[DataStore] Cleared cache for: ${filename}`);
    } else {
      this.cache = {};
      console.log(`[DataStore] Cleared all cache`);
    }
  }

  /**
   * Check if a file exists
   * @param {string} filename - Name of the file
   * @returns {boolean} True if file exists
   */
  exists(filename) {
    const filePath = this.getFilePath(filename);
    return fs.existsSync(filePath);
  }

  /**
   * Delete a data file
   * @param {string} filename - Name of the file to delete
   * @returns {boolean} Success status
   */
  delete(filename) {
    try {
      const filePath = this.getFilePath(filename);
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        delete this.cache[filename];
        console.log(`[DataStore] Deleted file: ${filename}`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error(`[DataStore] Error deleting file ${filename}:`, error.message);
      return false;
    }
  }
}

// Export singleton instance
module.exports = new DataStore();

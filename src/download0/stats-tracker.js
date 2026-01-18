// Statistics tracker using file-based storage

var stats = {
    total: 0,
    success: 0,
    filename: 'stats.json',

    // Load stats from file
    load: function(callback) {
        var self = this;
        fs.read(this.filename, function(err, data) {
            if (!err && data) {
                try {
                    var parsed = JSON.parse(data);
                    self.total = parsed.total || 0;
                    self.success = parsed.success || 0;
                    log('[STATS] Loaded: total=' + self.total + ', success=' + self.success);
                } catch (e) {
                    log('[STATS] Failed to parse stats file, starting fresh');
                    self.total = 0;
                    self.success = 0;
                }
            } else {
                log('[STATS] No stats file found, starting fresh');
                self.total = 0;
                self.success = 0;
            }
            if (callback) callback();
        });
    },

    // Save stats to file
    save: function(callback) {
        var data = JSON.stringify({
            total: this.total,
            success: this.success
        });
        fs.write(this.filename, data, function(err) {
            if (err) {
                log('[STATS] Failed to save stats: ' + err);
            } else {
                log('[STATS] Saved: total=' + stats.total + ', success=' + stats.success);
            }
            if (callback) callback(err);
        });
    },

    // Increment total counter
    incrementTotal: function(callback) {
        this.total++;
        log('[STATS] Total incremented to: ' + this.total);
        this.save(callback);
    },

    // Increment success counter
    incrementSuccess: function(callback) {
        this.success++;
        log('[STATS] Success incremented to: ' + this.success);
        this.save(callback);
    },

    // Get current stats
    get: function() {
        return {
            total: this.total,
            success: this.success,
            failureRate: this.total > 0 ? ((this.total - this.success) / this.total * 100).toFixed(2) + '%' : '0%',
            successRate: this.total > 0 ? (this.success / this.total * 100).toFixed(2) + '%' : '0%'
        };
    },

    // Print current stats
    print: function() {
        var current = this.get();
        log('[STATS] ====== Statistics ======');
        log('[STATS] Total:        ' + current.total);
        log('[STATS] Success:      ' + current.success);
        log('[STATS] Failures:     ' + (this.total - this.success));
        log('[STATS] Success Rate: ' + current.successRate);
        log('[STATS] Failure Rate: ' + current.failureRate);
        log('[STATS] =======================');
    },

    // Reset stats
    reset: function(callback) {
        this.total = 0;
        this.success = 0;
        log('[STATS] Stats reset');
        this.save(callback);
    }
};

// Example usage:
// stats.load(function() {
//     stats.incrementTotal();
//     stats.incrementSuccess();
//     stats.print();
// });

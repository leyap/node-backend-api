module.exports = {
    apps: [{
        name: "backend api",
        script: 'index.js',
        watch: false,
        instances: 4,
        instance_var: "isMaster",
        exec_mode: "cluster",
        max_restarts: 3,
        restart_delay: 5000,
        log_date_format: "YYYY-MM-DD HH:mm Z",
        combine_logs: true
    }]
};

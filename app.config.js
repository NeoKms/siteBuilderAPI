module.exports = {
    apps : [{
        error_file : "/var/log/pm2_err.log",
        out_file : "/var/log/pm2_out.log",
        name: "app",
        script: "npm",
        watch: true,
        args: "start",
        cwd: "/var/siteBuilderAPI/",
        ignore_watch: [
            "package-lock.json",
            "package.json",
            "node_modules",
            ".git",
            ".*"
        ]
    }]
}

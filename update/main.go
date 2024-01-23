package main

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"

	"github.com/gin-gonic/gin"
)

func main() {
	gin.SetMode("release")
	engine := gin.Default()
	api := engine.Group("/update")

	api.Any("/*path", update)

	if err := engine.Run(":20001"); err != nil {
		panic(err)
	}
}

func update(c *gin.Context) {
	var req struct {
		Path     string `uri:"path" binding:"required"`
		fileName string
	}

	if err := c.ShouldBindUri(&req); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Parse uri failed"})
		return
	}

	req.Path = filepath.Join("./static", req.Path)
	req.fileName = filepath.Base(req.Path)
	fmt.Println(req)

	_, err := os.Stat(req.Path)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "File not found"})
		return
	}

	c.Header("Content-Disposition", "attachment; filename="+req.fileName)
	c.Header("Content-Type", "application/octet-stream")

	c.File(req.Path)
}

# Makefile for LaTeX presentation

# Variables
MAIN = presentation
TEX = $(MAIN).tex
PDF = $(MAIN).pdf

# Default target
all: $(PDF)

# Compile LaTeX to PDF
$(PDF): $(TEX)
	pdflatex $(TEX)
	pdflatex $(TEX)  # Run twice for proper references

# Clean auxiliary files
clean:
	rm -f *.aux *.log *.nav *.out *.snm *.toc *.vrb *.fls *.fdb_latexmk

# Clean all generated files including PDF
cleanall: clean
	rm -f $(PDF)

# View PDF (Windows)
view: $(PDF)
	start $(PDF)

# Help
help:
	@echo "Available targets:"
	@echo "  all      - Compile LaTeX to PDF"
	@echo "  clean    - Remove auxiliary files"
	@echo "  cleanall - Remove all generated files"
	@echo "  view     - Open PDF in default viewer"
	@echo "  help     - Show this help"

.PHONY: all clean cleanall view help
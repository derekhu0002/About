!INC Local Scripts.EAConstants-JScript

/*
 * Script Name: 
 * Author: 
 * Purpose: 
 * Date: 
 */
 
function main(packageid)
{
    Session.Output("main start...");
	var docGenerator as EA.DocumentGenerator;
	docGenerator = Repository.CreateDocumentGenerator();
	var elementSet = {0:true};

	try{
		if ( docGenerator.NewDocument("doc_gen_main")) {
            
			var package as EA.Package;
			package = Repository.GetPackageByID(packageid);
			
			for (var i = 0; i < package.Packages.Count; i++) {
                
				var subPackage as EA.Package;
				subPackage = package.Packages.GetAt(i);
                
				var packageContent = processPackage(subPackage.PackageID, 0, elementSet);
                
				docGenerator.LoadDocument(packageContent);
			}
           
			var rtf = docGenerator.GetDocumentAsRTF();
			return rtf;
		}
	} catch (e) {
			Session.Output("main fail!" + e);
	}
}

function documentPackage(package, packageLevel) {
	Session.Output("documentPackage start." + package.Name + " at packagelevel:" + packageLevel);
	try{
		var docGenerator as EA.DocumentGenerator;
		docGenerator = Repository.CreateDocumentGenerator();
		
		if (docGenerator.NewDocument("package")) {
			docGenerator.DocumentPackage(package.PackageID, packageLevel, "package");
			var filename = "D:\\temp\\" + package.Name + "_tempforpackage.rtf";
			docGenerator.SaveDocument(filename, 0);
			return filename;
		}
	} catch (e) {
		Session.Output("documentPackage fail!" + e);
	}
	return "";
}

function processPackage(packageid, packageLevel, elementSet) {
	Session.Output("processPackage start packageid:" + packageid + " at packagelevel:" + packageLevel);
	try {
		var docGenerator as EA.DocumentGenerator;
		docGenerator = Repository.CreateDocumentGenerator();
		
		var package as EA.Package;
		package = Repository.GetPackageByID(packageid);
		
		if (checkIfEmpty(package) == 0) {
			try {
				if (docGenerator.NewDocument("package")) {
					docGenerator.DocumentPackage(package.PackageID, packageLevel, "package");
					var filename = "D:\\temp\\" + package.Name + ".rtf";
					docGenerator.SaveDocument(filename, 0);
					return filename;
				}
			} catch (e) {
				Session.Output("checkIfEmpty fail!" + e);
			}
			return "";
		}
		
		if ((package.Name == "Interface") || (package.Name == "接口描述")) {
			if (docGenerator.NewDocument("interface")) {
				var docP = documentPackage(package, packageLevel);
				docGenerator.LoadDocument(docP);
				processInterface(package, docGenerator, packageLevel, elementSet);
				var filename = "D:\\temp\\" + package.Name + ".rtf";
				docGenerator.SaveDocument(filename, 0);
				return filename;
			}
		}
		
		if (docGenerator.NewDocument("diagramandelements")) {
            
			var docP = documentPackage(package, packageLevel);
			docGenerator.LoadDocument(docP);
			
			var packageNextLevel = packageLevel + 1;
			processDiagrams(package, docGenerator, packageLevel, elementSet);
			for (var i = 0; i < package.Packages.Count; i++) {
				var subPackage as EA.Package;
				subPackage = package.Packages.GetAt(i);
				var packageContent = processPackage(subPackage.PackageID, packageNextLevel, elementSet);
				docGenerator.LoadDocument(packageContent);
			}
			var filename = "D:\\temp\\" + package.Name + ".rtf";
			docGenerator.SaveDocument(filename, 0);
			return filename;
		}
	} catch (e) {
		Session.Output("processPackage fail!" + e);
	}
	return "";
}

function checkIfEmpty(package) {
    
	var childPackageCount = package.Packages.Count;
	var chileDiagramsCount = package.Diagrams.Count;
	var chileElementCount = package.Elements.Count;
	
	if ((childPackageCount == 0) && (chileDiagramsCount == 0) && (chileElementCount == 0)) {
		return 0;
	}
	
	return 1;
}

function processInterfaces(package, docGenerator, packageLevel, elementSet) {
	Session.Output("processInterfaces start." + package.Name + " at packagelevel:" + packageLevel);
	try {
		for (var i = 0; i < package.Diagrams.Count; i++) {
			var diagram as EA.Diagram;
			diagram = package.Diagrams.GetAt(i);
			processInterface(diagram, docGenerator, packageLevel, elementSet);
		}
	} catch (e) {
		Session.Output("processPackage fail!" + e);
	}
}

function processDiagrams(package, docGenerator, packageLevel, elementSet){
	Session.Output("processDiagrams start." + package.Name + " at packagelevel:" + packageLevel);
	try{
		for (var i = 0; i < package.Diagrams.Count; i++) {
            
			var diagram as EA.Diagram;
			diagram = package.Diagrams.GetAt(i);
            
			processDiagram(diagram, docGenerator, packageLevel, elementSet);
            
		}
	} catch (e) {
		Session.Output("processDiagrams fail!" + e);
	}
}

function processInterface(diagram, docGenerator, packageLevel, elementSet) {
	processInterfaceInner(diagram, docGenerator, packageLevel + 1, elementSet);
}

function processDiagram(diagram, docGenerator, packageLevel, elementSet) {
	Session.Output("processDiagram start." + diagram.Name + " at packagelevel:" + packageLevel);
	
	docGenerator.DocumentDiagram(diagram.DiagramID, packageLevel + 1, "diagramandelements");
	processDiagramLinks(diagram, docGenerator, packageLevel + 1);
	processDiagramObjects(diagram, docGenerator, packageLevel + 1, elementSet);
}

function processInterfaceInner(diagram, docGenerator, packageLevel, elementSet) {
	Session.Output("processInterfaceInner start." + diagram.Name + " at packagelevel:" + packageLevel);
	
	var diagramObjects as EA.Collection;
	diagramObjects = diagram.DiagramObjects;
	
	for (var i = 0; i < diagramObjects.Count; i++) {
		var diagramObject as EA.DiagramObject;
		diagramObject = diagramObjects.GetAt(i);
		var currentElement as EA.Element;
		currentElement = Repository.GetElementByID(diagramObject.ElementID);
		docGenerator.DocumentElement(currentElement.ElementID, packageLevel, "interface");
		
		var validCount = 0;
		for (var j = 0; j < currentElement.BaseClasses.Count; j++) {
			var baseElement as EA.Element;
			baseElement = currentElement.BaseClasses.GetAt(j);
			if (baseElement.Notes == "") {
				continue;
			}
			
			if (validCount == 0) {
				docGenerator.InsertText("More Info:\n", "Bold");
			}
			
			validCount++;
			var bookmark = "#BKM_" + baseElement.ElementGUID.replace(/[{}]/g, "").replace(/\-/g, "_");
			docGenerator.InsertHyperlink(baseElement.Name, bookmark);
			docGenerator.InsertText("\n", "");
		}
	}
}

function processDiagramObjects(diagram, docGenerator, packageLevel, elementSet) {
	Session.Output("processDiagramObjects start." + diagram.Name + " at packagelevel:" + packageLevel);
	
	var diagramObjects as EA.Collection;
	diagramObjects = diagram.DiagramObjects;
	var currentElementSet = {0:true};
	
	for (var i = 0; i < diagramObjects.Count; i++) {
		var diagramObject as EA.DiagramObject;
		diagramObject = diagramObjects.GetAt(i);
		var currentElement as EA.Element;
		currentElement = Repository.GetElementByID(diagramObject.ElementID);
		if (elementSet[currentElement.ElementID] == true) {
			continue;
		}
		if ((currentElement.Type == "Notes") || (currentElement.Notes == "") || (currentElement.Name == "")) {
			continue;
		}
		
		docGenerator.DocumentElement(currentElement.ElementID, packageLevel, "diagramandelements");
		
		var validCount = 0;
		for (var j = 0; j < currentElement.BaseClasses.Count; j++) {
			var baseElement as EA.Element;
			baseElement = currentElement.BaseClasses.GetAt(j);
			if (baseElement.Notes == "") {
				continue;
			}
			
			if (validCount == 0) {
				docGenerator.InsertText("More Info:\n", "Bold");
			}
			
			validCount++;
			var bookmark = "#BKM_" + baseElement.ElementGUID.replace(/[{}]/g, "").replace(/\-/g, "_");
			docGenerator.InsertHyperlink(baseElement.Name, bookmark);
			docGenerator.InsertText("\n", "");
		}
		
		elementSet[currentElement.ElementID] = true;
		currentElementSet[currentElement.ElementID] = true;
		processElement(currentElement, docGenerator, packageLevel, elementSet);
	}
}

function processDiagramLinks(diagram, docGenerator, packageLevel) {
	Session.Output("processDiagramLinks start." + diagram.Name + " at packagelevel:" + packageLevel);
	
	var diagramLinks as EA.Collection;
	diagramLinks = diagram.DiagramLinks;
	
	for (var i = 0; i < diagramLinks.Count; i++) {
		var diagramLink as EA.DiagramLink;
		diagramLink = diagramLinks.GetAt(i);
		var currentConnector as EA.Connector;
		currentConnector = Repository.GetConnectorByID(diagramLink.ConnectorID);
		
		processConnector(currentConnector, docGenerator, packageLevel);
	}
}

function processConnector(currentConnector, docGenerator, packageLevel) {
	Session.Output("processConnector start." + currentConnector.Name + " at packagelevel:" + packageLevel);
	
	if ((currentConnector.Name == "") || (currentConnector.Notes == "")) {
		return;
	}
	
	docGenerator.DocumentConnector(currentConnector.ConnectorID, packageLevel, "diagramandelements");
}

function processElement(currentElement, docGenerator, packageLevel, elementSet) {
	Session.Output("processElement start." + currentElement.Name + " at packagelevel:" + packageLevel);
	
	processDiagramsInElement(currentElement, docGenerator, packageLevel, elementSet);
}

function processDiagramsInElement(currentElement, docGenerator, packageLevel, elementSet) {
	Session.Output("processDiagramsInElement start." + currentElement.Name + " at packagelevel:" + packageLevel);
	
	for (var i = 0; i < currentElement.Diagrams.Count; i++) {
		var diagram as EA.Diagram;
		diagram = currentElement.Diagrams.GetAt(i);
		docGenerator.DocumentDiagram(diagram.DiagramID, packageLevel, "diagramandelements");
		processDiagramLinks(diagram, docGenerator, packageLevel);
		processDiagramObjects(diagram, docGenerator, packageLevel, elementSet);
	}
}
!INC Local Scripts.EAConstants-JScript
!INC EAScriptLib.JScript-CSV

/*
 * Script Name: 
 * Author: 
 * Purpose: 
 * Date: 
 */

function processPackage(package){
	processElements(package);
	var subPackages as EA.Collection;
	subPackages = package.Packages;
	
	for (var i = 0; i < subPackages.Count; i++) {
		var subPackage as EA.Package;
		subPackage = subPackages.GetAt(i);
		processPackage(subPackage);
	}
}

function processElements(package){
	var elements as EA.Collection;
	elements = package.Elements;
	
	for (var i = 0; i < elements.Count; i++) {
		var element as EA.Element;
		element = elements.GetAt(i);
		var requirements as EA.Collection;
		requirements = element.Requirements;
		for (var j = 0; j < requirements.Count; j++) {
			var valueMap = CSVECreateEmptyValueMap();
			var req as EA.Requirement;
			var temppackage as EA.Package;
			req = requirements.GetAt(j);
			temppackage = Repository.GetPackageByID(element.PackageID);
			Session.Output("Element:" + element.Name + ", Requirement name:" + req.Name + " package:" + temppackage.Name);
			valueMap.Add("Requirement", req.Name);
			valueMap.Add("Desc", req.Notes);
			valueMap.Add("Element", temppackage.Name + ":" + element.Name);
			CSVEExportRow(valueMap);
		}
	}
}

function main()
{
	// Show the script output window
	Repository.EnsureOutputVisible( "Script" );

	Session.Output( "JScript-CSVImport..." );
	Session.Output( "=======================================" );
	// Get the currently selected package in the tree to work on
	var thePackage as EA.Package;
	thePackage = Repository.GetTreeSelectedPackage();
	var columns = new Array();
	columns.push("Requirement");
	columns.push("Desc");
	columns.push("Element");
	CSVEExportInitialize(csvFile, columns, true);
	processPackage(thePackage);
	CSVEExportFinalize();
}

var csvFile = "d:\\Models\\TestExport.csv";
main();